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
  plan: MembershipPlan;
  goal: WorkoutGoal;
  timing: Timing;
  createdAt: string;
}

const USERS_KEY = "gym_users";
const ADMIN_KEY = "gym_admin_session";

const DEFAULT_ADMIN_EMAIL = "roshni.roy280710@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "Roshni@#2610";

function resolveAdminEmail(): string {
  // Hardcoding for now to ensure user can login
  return "roshni.roy280710@gmail.com";
}

function resolveAdminPassword(): string {
  // Hardcoding for now to ensure user can login
  return "Roshni@#2610";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
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

export async function registerUser(
  data: Omit<GymUser, "rank" | "createdAt">,
): Promise<{
  ok: boolean;
  error?: string;
  user?: GymUser;
}> {
  const normalizedEmail = normalizeEmail(data.email);
  const users = getUsers();

  if (supabase) {
    const { data: existing } = await supabase
      .from("gym_users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (existing) {
      return { ok: false, error: "Email already registered" };
    }
  }

  const user: GymUser = {
    ...data,
    email: normalizedEmail,
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
        error:
          insertError.message ||
          "Could not save membership to Supabase. Check the gym_users table and RLS.",
      };
    }
  }

  return { ok: true, user };
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
    .select(
      "id,rank,full_name,age,gender,mobile,email,address,plan,goal,timing,created_at",
    )
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

export async function getSessionUser(): Promise<GymUser | null> {
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from("gym_users")
    .select(
      "id,rank,full_name,age,gender,mobile,email,address,plan,goal,timing,created_at",
    )
    .eq("id", session.user.id)
    .maybeSingle<SupabaseGymUserRow>();

  if (error || !data) return null;
  return toGymUser(data);
}

export async function logoutUser() {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

/** Same check as admin login, without writing session (for member login page to reject staff creds). */
export function isAdminCredentialMatch(
  email: string,
  password: string,
): boolean {
  const e = email.trim().toLowerCase();
  const p = password.trim();
  return (
    e === resolveAdminEmail().trim().toLowerCase() &&
    p === resolveAdminPassword().trim()
  );
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

export async function deleteUser(id: string): Promise<{ ok: boolean; error?: string }> {
  const users = getUsers();
  saveUsers(users.filter((u) => u.id !== id));

  if (supabase) {
    const { error } = await supabase.from("gym_users").delete().eq("id", id);
    if (error) {
      console.error("Supabase delete error:", error);
      return { ok: false, error: error.message };
    }
  }
  return { ok: true };
}

export async function updateUser(
  id: string,
  data: Partial<Omit<GymUser, "id" | "createdAt">>,
): Promise<{ ok: boolean; error?: string }> {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...data };
    saveUsers(users);
  }

  if (supabase) {
    const { error } = await supabase.from("gym_users").update({
      full_name: data.fullName,
      age: data.age,
      gender: data.gender,
      mobile: data.mobile,
      address: data.address,
      plan: data.plan,
      goal: data.goal,
      timing: data.timing,
    }).eq("id", id);
    
    if (error) {
      console.error("Supabase update error:", error);
      return { ok: false, error: error.message };
    }
  }
  return { ok: true };
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_KEY);
}

