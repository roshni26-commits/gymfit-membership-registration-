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

export const ADMIN_EMAIL = "admin@gym.com";
export const ADMIN_PASSWORD = "admin123";

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

export function registerUser(data: Omit<GymUser, "id" | "rank" | "createdAt">): { ok: boolean; error?: string; user?: GymUser } {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { ok: false, error: "Email already registered" };
  }
  const user: GymUser = {
    ...data,
    id: crypto.randomUUID(),
    rank: users.length + 1,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  return { ok: true, user };
}

export function loginUser(email: string, password: string): GymUser | null {
  const user = getUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );
  if (user) {
    localStorage.setItem(SESSION_KEY, user.id);
    return user;
  }
  return null;
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

export function loginAdmin(email: string, password: string): boolean {
  if (email.trim().toLowerCase() === ADMIN_EMAIL && password.trim() === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_KEY, "1");
    return true;
  }
  return false;
}

export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_KEY) === "1";
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_KEY);
}
