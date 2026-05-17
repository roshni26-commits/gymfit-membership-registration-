import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { registerUser, type Gender, type MembershipPlan, type WorkoutGoal, type Timing } from "@/lib/gym-store";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Join IRONFORGE — Membership Registration" }] }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", age: "", gender: "" as Gender | "", mobile: "", email: "", address: "",
    password: "", plan: "" as MembershipPlan | "", goal: "" as WorkoutGoal | "", timing: "" as Timing | "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return toast.error("Full name required");
    const age = Number(form.age);
    if (!age || age < 12 || age > 100) return toast.error("Enter a valid age");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error("Invalid email");
    if (!/^\d{10}$/.test(form.mobile)) return toast.error("Mobile must be 10 digits");
    if (form.password.length < 6) return toast.error("Password min 6 chars");
    if (!form.gender || !form.plan || !form.goal || !form.timing) return toast.error("Fill all fields");

    if (!supabase) return toast.error("Supabase not configured");

    const normalizedEmail = form.email.trim().toLowerCase();
    
    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: form.password.trim(),
    });

    if (authError) {
      console.error("Auth error:", authError);
      return toast.error(authError.message);
    }

    if (!authData.user) return toast.error("Failed to create user account");

    // 2. Save extra info to gym_users table
    const res = await registerUser({
      id: authData.user.id,
      fullName: form.fullName.trim(),
      age,
      gender: form.gender as Gender,
      mobile: form.mobile,
      email: normalizedEmail,
      address: form.address,
      plan: form.plan as MembershipPlan,
      goal: form.goal as WorkoutGoal,
      timing: form.timing as Timing,
    });

    if (!res.ok) {
      console.error("Metadata error:", res.error);
      // Note: User is already created in Auth, but metadata failed. 
      // In a real app, you might want to handle this rollback or retry.
      return toast.error(`Account created but details failed: ${res.error}`);
    }

    toast.success("Welcome to IRONFORGE! Please check your email for confirmation.");
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" />
      <SiteNav />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="text-center">
          <h1 className="text-5xl text-glow blink">Become a <span className="text-gradient-primary">Member</span></h1>
          <p className="mt-3 text-muted-foreground floaty">Pick your plan. Pick your goal. We'll handle the rest.</p>
        </div>

        <form onSubmit={onSubmit} className="glass smart-border mt-10 rounded-2xl p-8 space-y-8 shadow-glow perspective-1000">
          <Section title="Basic Information">
            <Field label="Full Name"><Input className="bg-background/50 border-primary/20 focus:border-primary transition-all" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} /></Field>
            <Field label="Age"><Input type="number" className="bg-background/50 border-primary/20 focus:border-primary transition-all" value={form.age} onChange={(e) => set("age", e.target.value)} /></Field>
            <Field label="Gender">
              <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger className="bg-background/50 border-primary/20"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="glass"><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label="Mobile Number"><Input className="bg-background/50 border-primary/20 focus:border-primary transition-all" value={form.mobile} onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} /></Field>
            <Field label="Email"><Input type="email" className="bg-background/50 border-primary/20 focus:border-primary transition-all" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Password"><Input type="password" className="bg-background/50 border-primary/20 focus:border-primary transition-all" value={form.password} onChange={(e) => set("password", e.target.value)} /></Field>
            <div className="md:col-span-2">
              <Field label="Address"><Textarea className="bg-background/50 border-primary/20 focus:border-primary transition-all" value={form.address} onChange={(e) => set("address", e.target.value)} rows={2} /></Field>
            </div>
          </Section>

          <Section title="Membership Details">
            <Field label="Membership Plan">
              <Select value={form.plan} onValueChange={(v) => set("plan", v)}>
                <SelectTrigger className="bg-background/50 border-primary/20"><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent className="glass"><SelectItem value="Monthly">Monthly</SelectItem><SelectItem value="Quarterly">Quarterly</SelectItem><SelectItem value="Yearly">Yearly</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label="Workout Goal">
              <Select value={form.goal} onValueChange={(v) => set("goal", v)}>
                <SelectTrigger className="bg-background/50 border-primary/20"><SelectValue placeholder="Select goal" /></SelectTrigger>
                <SelectContent className="glass"><SelectItem value="Weight Loss">Weight Loss</SelectItem><SelectItem value="Muscle Gain">Muscle Gain</SelectItem><SelectItem value="Fitness">Fitness</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label="Preferred Timing">
              <Select value={form.timing} onValueChange={(v) => set("timing", v)}>
                <SelectTrigger className="bg-background/50 border-primary/20"><SelectValue placeholder="Select timing" /></SelectTrigger>
                <SelectContent className="glass"><SelectItem value="Morning">Morning</SelectItem><SelectItem value="Afternoon">Afternoon</SelectItem><SelectItem value="Evening">Evening</SelectItem></SelectContent>
              </Select>
            </Field>
          </Section>

          <Button type="submit" size="lg" className="w-full bg-gradient-primary text-base font-bold uppercase tracking-widest shadow-primary pulse-glow hover:scale-105 transition-all">Forge My Membership</Button>
          <p className="text-center text-sm text-muted-foreground">
            Already a member? <Link to="/login" className="text-primary hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-2xl text-primary">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>{children}</div>;
}
