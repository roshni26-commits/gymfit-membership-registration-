import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { loginUser } from "@/lib/gym-store";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { LogIn } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Member Login — IRONFORGE" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = loginUser(email, password);
    if (!u) return toast.error("Invalid credentials");
    toast.success(`Welcome back, ${u.fullName.split(" ")[0]}`);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" />
      <SiteNav />
      <div className="mx-auto flex max-w-md flex-col px-6 py-20">
        <div className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-5xl">Member <span className="text-gradient-red">Login</span></h1>
        </div>
        <form onSubmit={onSubmit} className="glass mt-8 space-y-5 rounded-2xl p-8 shadow-glow">
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <Button type="submit" className="w-full bg-gradient-red font-bold uppercase tracking-widest shadow-red">Enter The Forge</Button>
          <p className="text-center text-sm text-muted-foreground">
            New here? <Link to="/register" className="text-primary hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
