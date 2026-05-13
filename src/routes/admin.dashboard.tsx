import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { getMembersForAdmin, isAdmin, logoutAdmin, type GymUser } from "@/lib/gym-store";
import { LogOut, Users, Crown, Activity } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — IRONFORGE" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<GymUser[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      navigate({ to: "/admin/login" });
      return;
    }
    void (async () => {
      setUsers(await getMembersForAdmin());
      setReady(true);
    })();
  }, [navigate]);

  if (!ready) return null;

  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-primary">Admin Control</p>
            <h1 className="mt-1 text-5xl">Command <span className="text-gradient-red">Center</span></h1>
          </div>
          <Button variant="outline" onClick={() => { logoutAdmin(); navigate({ to: "/" }); }} className="border-primary/40 hover:bg-primary/10">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Stat icon={Users} label="Total Members" value={users.length} />
          <Stat icon={Crown} label="Yearly Plans" value={users.filter((u) => u.plan === "Yearly").length} />
          <Stat icon={Activity} label="Latest Member" value={users.at(-1)?.fullName.split(" ")[0] ?? "—"} />
        </div>

        <div className="glass mt-10 rounded-2xl p-2 md:p-6">
          <h2 className="px-4 pt-4 text-2xl text-primary md:px-0 md:pt-0">Registered Members</h2>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No members yet.</TableCell></TableRow>
                )}
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-bold text-primary">#{u.rank}</TableCell>
                    <TableCell className="font-semibold">{u.fullName}</TableCell>
                    <TableCell><span className="rounded-full border border-border/60 px-2 py-0.5 text-xs uppercase">Member</span></TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>{u.plan}</TableCell>
                    <TableCell>{u.goal}</TableCell>
                    <TableCell className="text-right">
                      <UserDetailDialog user={u} />
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
    <div className="glass rounded-xl p-6">
      <Icon className="h-8 w-8 text-primary" />
      <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

function UserDetailDialog({ user }: { user: GymUser }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-primary/40 hover:bg-primary/10">View</Button>
      </DialogTrigger>
      <DialogContent className="glass">
        <DialogHeader><DialogTitle className="text-3xl">{user.fullName}</DialogTitle></DialogHeader>
        <dl className="grid gap-3 text-sm">
          {[
            ["Rank", `#${user.rank}`], ["Age", user.age], ["Gender", user.gender],
            ["Mobile", user.mobile], ["Email", user.email], ["Address", user.address || "—"],
            ["Plan", user.plan], ["Goal", user.goal], ["Timing", user.timing],
            ["Joined", new Date(user.createdAt).toLocaleString()],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-border/40 pb-2">
              <dt className="uppercase tracking-wider text-muted-foreground">{k}</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
