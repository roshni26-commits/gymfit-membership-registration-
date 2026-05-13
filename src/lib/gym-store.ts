import { supabase } from "@/lib/supabase";

export type MembershipPlan = "Monthly" | "Quarterly" | "Yearly";
export type WorkoutGoal = "Weight Loss" | "Muscle Gain" | "Fitness";
export type Timing = "Morning" | "Afternoon" | "Evening";
export type Gender = "Male" | "Female" | "Other";

export interface GymUser {
  id: string;
  rank: number;
  fullName: string;
  age: number;
  gender: Gender;
  mobile: string;
  email: string;
  address: string;
  password: string;
  plan: MembershipPlan;
  goal: WorkoutGoal;
  timing: Timing;
  createdAt: string;
}

const USERS_KEY = "gym_users";
const SESSION_KEY = "gym_session";
const ADMIN_KEY = "gym_admin_session";

const DEFAULT_ADMIN_EMAIL = "admin@gym.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";

function resolveAdminEmail(): string {
  const v = import.meta.env.VITE_ADMIN_EMAIL;
  if (typeof v === "string" && v.trim() !== "") return v.trim();
  return DEFAULT_ADMIN_EMAIL;
}

function resolveAdminPassword(): string {
  const v = import.meta.env.VITE_ADMIN_PASSWORD;
  if (typeof v === "string" && v.trim() !== "") return v.trim();
  return DEFAULT_ADMIN_PASSWORD;
}

/** Shown on admin login; matches what `loginAdmin` checks (optional env overrides). */
export const ADMIN_EMAIL = resolveAdminEmail();
export const ADMIN_PASSWORD = resolveAdminPassword();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePassword(password: string): string {
  return password.trim();
}

export function getUsers(): GymUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveUsers(users: GymUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function registerUser(data: Omit<GymUser, "id" | "rank" | "createdAt">): Promise<{
  ok: boolean;
  error?: string;
  user?: GymUser;
}> {
  const normalizedEmail = normalizeEmail(data.email);
  const normalizedPassword = normalizePassword(data.password);
  const users = getUsers();
  if (users.some((u) => normalizeEmail(u.email) === normalizedEmail)) {
    return { ok: false, error: "Email already registered" };
  }

  if (supabase) {
    const { data: existing } = await supabase.from("gym_users").select("id").eq("email", normalizedEmail).maybeSingle();
    if (existing) {
      return { ok: false, error: "Email already registered" };
    }
  }

  const user: GymUser = {
    ...data,
    email: normalizedEmail,
    password: normalizedPassword,
    id: crypto.randomUUID(),
    rank: users.length + 1,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);

  if (supabase) {
    const { error: insertError } = await supabase.from("gym_users").insert({
      id: user.id,
      rank: user.rank,
      full_name: user.fullName,
      age: user.age,
      gender: user.gender,
      mobile: user.mobile,
      email: user.email,
      address: user.address,
      password: user.password,
      plan: user.plan,
      goal: user.goal,
      timing: user.timing,
      created_at: user.createdAt,
    });
    if (insertError) {
      console.error("Supabase gym_users insert:", insertError);
      saveUsers(getUsers().filter((u) => u.id !== user.id));
      return {
        ok: false,
        error: insertError.message || "Could not save membership to Supabase. Check the gym_users table and RLS.",
      };
    }
  }

  return { ok: true, user };
}

export function loginUser(email: string, password: string): GymUser | null {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = normalizePassword(password);
  const user = getUsers().find(
    (u) => normalizeEmail(u.email) === normalizedEmail && normalizePassword(u.password) === normalizedPassword,
  );
  if (user) {
    localStorage.setItem(SESSION_KEY, user.id);
    return user;
  }
  return null;
}

type SupabaseGymUserRow = {
  id: string;
  rank: number | null;
  full_name: string;
  age: number;
  gender: Gender;
  mobile: string;
  email: string;
  address: string;
  password: string;
  plan: MembershipPlan;
  goal: WorkoutGoal;
  timing: Timing;
  created_at: string;
};

function toGymUser(row: SupabaseGymUserRow): GymUser {
  return {
    id: row.id,
    rank: row.rank ?? 1,
    fullName: row.full_name,
    age: row.age,
    gender: row.gender,
    mobile: row.mobile,
    email: row.email,
    address: row.address,
    password: row.password,
    plan: row.plan,
    goal: row.goal,
    timing: row.timing,
    createdAt: row.created_at,
  };
}

export async function fetchUsersFromSupabase(): Promise<GymUser[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("gym_users")
    .select("id,rank,full_name,age,gender,mobile,email,address,password,plan,goal,timing,created_at")
    .order("created_at", { ascending: true });
  if (error || !data) {
    if (error) console.error("Supabase gym_users list:", error);
    return [];
  }
  return (data as SupabaseGymUserRow[]).map(toGymUser);
}

/** Merges remote rows with any local-only members and assigns display ranks by join order. */
export async function getMembersForAdmin(): Promise<GymUser[]> {
  const local = getUsers();
  if (!supabase) return local;

  const remote = await fetchUsersFromSupabase();
  const byId = new Map<string, GymUser>();
  for (const u of remote) byId.set(u.id, u);
  for (const u of local) {
    if (!byId.has(u.id)) byId.set(u.id, u);
  }
  const merged = Array.from(byId.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  return merged.map((u, i) => ({ ...u, rank: i + 1 }));
}

export async function loginUserFromSupabase(email: string, password: string): Promise<GymUser | null> {
  if (!supabase) return null;

  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = normalizePassword(password);

  const { data, error } = await supabase
    .from("gym_users")
    .select(
      "id,rank,full_name,age,gender,mobile,email,address,password,plan,goal,timing,created_at",
    )
    .eq("email", normalizedEmail)
    .maybeSingle<SupabaseGymUserRow>();

  if (error || !data) return null;
  if (normalizePassword(data.password) !== normalizedPassword) return null;

  const user = toGymUser(data);
  const users = getUsers();
  if (!users.some((u) => u.id === user.id)) {
    saveUsers([...users, { ...user, rank: users.length + 1 }]);
  }
  localStorage.setItem(SESSION_KEY, user.id);
  return user;
}

export function getSessionUser(): GymUser | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return getUsers().find((u) => u.id === id) ?? null;
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

/** Same check as admin login, without writing session (for member login page to reject staff creds). */
export function isAdminCredentialMatch(email: string, password: string): boolean {
  const e = email.trim().toLowerCase();
  const p = password.trim();
  return e === ADMIN_EMAIL.trim().toLowerCase() && p === ADMIN_PASSWORD.trim();
}

export function loginAdmin(email: string, password: string): boolean {
  if (!isAdminCredentialMatch(email, password)) return false;
  localStorage.setItem(ADMIN_KEY, "1");
  return true;
}

export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_KEY) === "1";
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_KEY);
}
