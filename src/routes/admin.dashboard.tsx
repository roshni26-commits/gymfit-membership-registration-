import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { getMembersForAdmin, isAdmin, logoutAdmin, type GymUser, deleteUser, updateUser, type Gender, type MembershipPlan, type WorkoutGoal, type Timing } from "@/lib/gym-store";
import { LogOut, Users, Crown, Activity, Trash2, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — IRONFORGE" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<GymUser[]>([]);
  const [ready, setReady] = useState(false);

  const refreshUsers = async () => {
    setUsers(await getMembersForAdmin());
  };

  useEffect(() => {
    if (!isAdmin()) {
      navigate({ to: "/admin/login" });
      return;
    }
    void (async () => {
      await refreshUsers();
      setReady(true);
    })();
  }, [navigate]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      const res = await deleteUser(id);
      if (res.ok) {
        toast.success(`${name} removed from the forge.`);
        await refreshUsers();
      } else {
        toast.error(`Error: ${res.error}`);
      }
    }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" />
      <SiteNav />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-primary blink">Admin Control</p>
            <h1 className="mt-1 text-5xl text-glow">Command <span className="text-gradient-primary">Center</span></h1>
          </div>
          <Button variant="outline" onClick={() => { logoutAdmin(); navigate({ to: "/" }); }} className="border-primary/40 hover:bg-primary/10 transition-all hover:scale-105">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3 perspective-1000">
          <Stat icon={Users} label="Total Members" value={users.length} />
          <Stat icon={Crown} label="Yearly Plans" value={users.filter((u) => u.plan === "Yearly").length} />
          <Stat icon={Activity} label="Latest Member" value={users.at(-1)?.fullName.split(" ")[0] ?? "—"} />
        </div>

        <div className="glass smart-border mt-10 rounded-2xl p-2 md:p-6 shadow-glow">
          <h2 className="px-4 pt-4 text-2xl text-primary text-glow md:px-0 md:pt-0">Registered Members</h2>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-primary/20">
                  <TableHead className="text-primary font-bold">Rank</TableHead>
                  <TableHead className="text-primary font-bold">Name</TableHead>
                  <TableHead className="text-primary font-bold">Role</TableHead>
                  <TableHead className="text-primary font-bold">Email</TableHead>
                  <TableHead className="text-primary font-bold">Plan</TableHead>
                  <TableHead className="text-primary font-bold">Goal</TableHead>
                  <TableHead className="text-right text-primary font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No members yet.</TableCell></TableRow>
                )}
                {users.map((u) => (
                  <TableRow key={u.id} className="border-primary/10 hover:bg-primary/5 transition-colors group">
                    <TableCell className="font-bold text-primary text-glow">#{u.rank}</TableCell>
                    <TableCell className="font-semibold group-hover:text-primary transition-colors">{u.fullName}</TableCell>
                    <TableCell><span className="rounded-full border border-primary/30 px-2 py-0.5 text-xs uppercase text-primary/80">Member</span></TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>{u.plan}</TableCell>
                    <TableCell>{u.goal}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <UserDetailDialog user={u} onUpdate={refreshUsers} />
                        <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-500/10 hover:scale-110 transition-transform" onClick={() => handleDelete(u.id, u.fullName)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="glass hover-lift card-3d rounded-xl p-6">
      <Icon className="h-8 w-8 text-primary drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]" />
      <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold text-glow">{value}</p>
    </div>
  );
}

function UserDetailDialog({ user, onUpdate }: { user: GymUser; onUpdate: () => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ ...user });

  const handleUpdate = async () => {
    const res = await updateUser(user.id, {
      fullName: form.fullName,
      age: form.age,
      mobile: form.mobile,
      address: form.address,
      plan: form.plan as MembershipPlan,
      goal: form.goal as WorkoutGoal,
      timing: form.timing as Timing,
    });
    if (res.ok) {
      toast.success("Member updated successfully");
      setIsEditing(false);
      await onUpdate();
    } else {
      toast.error(`Update failed: ${res.error}`);
    }
  };

  return (
    <Dialog open={isEditing || undefined} onOpenChange={(open) => { if(!open) setIsEditing(false); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-primary/40 hover:bg-primary/10 hover:scale-105 transition-all">View/Edit</Button>
      </DialogTrigger>
      <DialogContent className="glass smart-border max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-3xl text-glow">{isEditing ? "Edit Member" : user.fullName}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)} className="hover:text-primary transition-colors">
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {isEditing ? (
          <div className="grid gap-4 py-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Full Name</Label><Input className="bg-background/50 border-primary/20" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} /></div>
            <div className="space-y-2"><Label>Age</Label><Input type="number" className="bg-background/50 border-primary/20" value={form.age} onChange={(e) => setForm({...form, age: Number(e.target.value)})} /></div>
            <div className="space-y-2"><Label>Mobile</Label><Input className="bg-background/50 border-primary/20" value={form.mobile} onChange={(e) => setForm({...form, mobile: e.target.value})} /></div>
            <div className="space-y-2"><Label>Address</Label><Input className="bg-background/50 border-primary/20" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} /></div>
            <div className="md:col-span-2 mt-4 flex gap-2">
              <Button className="flex-1 bg-gradient-primary pulse-glow" onClick={handleUpdate}>Save Changes</Button>
              <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <dl className="grid gap-3 text-sm">
            {[
              ["Rank", `#${user.rank}`], ["Age", user.age], ["Gender", user.gender],
              ["Mobile", user.mobile], ["Email", user.email], ["Address", user.address || "—"],
              ["Plan", user.plan], ["Goal", user.goal], ["Timing", user.timing],
              ["Joined", new Date(user.createdAt).toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/40 pb-2">
                <dt className="uppercase tracking-wider text-muted-foreground">{k}</dt>
                <dd className="font-semibold text-glow">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </DialogContent>
    </Dialog>
  );
}
