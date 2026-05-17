import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { isAdminCredentialMatch, loginAdmin, logoutUser } from "@/lib/gym-store";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — IRONFORGE" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Admin Login Attempt:", { email, password });
    
    // 1. Local Credential Match
    if (isAdminCredentialMatch(email, password)) {
      console.log("Credentials matched!");
      loginAdmin(email, password);
      toast.success("Admin access granted");
      
      // Using window.location as a fallback if navigate fails
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 500);
    } else {
      console.log("Credentials failed!");
      toast.error("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" />
      <SiteNav />
      <div className="mx-auto flex max-w-md flex-col px-6 py-20">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-5xl">Admin <span className="text-gradient-red">Access</span></h1>
        </div>
        <form onSubmit={onSubmit} className="glass mt-8 space-y-5 rounded-2xl p-8 shadow-glow">
          <div className="space-y-2">
            <Label>Admin Email</Label>
            <Input
              type="email"
              name="admin-email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              name="admin-password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-gradient-red font-bold uppercase tracking-widest shadow-red">Authenticate</Button>
          <p className="text-center text-xs text-muted-foreground">
            Member? <Link to="/login" className="text-primary hover:underline">Member login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
