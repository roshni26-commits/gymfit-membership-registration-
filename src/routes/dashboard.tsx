import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getSessionUser, logoutUser, type GymUser } from "@/lib/gym-store";
import { Calendar, Target, CreditCard, Clock, Hash, LogOut } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Member Dashboard — IRONFORGE" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<GymUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const u = await getSessionUser();
      if (!u) navigate({ to: "/login" });
      else setUser(u);
      setLoading(false);
    }
    load();
  }, [navigate]);

  if (loading) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-primary">Welcome back</p>
            <h1 className="mt-1 text-5xl">{user.fullName}</h1>
            <p className="mt-2 text-muted-foreground">Time to lift heavier than yesterday.</p>
          </div>
          <Button variant="outline" onClick={() => { logoutUser(); navigate({ to: "/" }); }} className="border-primary/40 hover:bg-primary/10">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Stat icon={CreditCard} label="Membership Plan" value={user.plan} accent />
          <Stat icon={Target} label="Workout Goal" value={user.goal} />
          <Stat icon={Clock} label="Preferred Timing" value={user.timing} />
          <Stat icon={Hash} label="Member Rank" value={`#${user.rank}`} />
          <Stat icon={Calendar} label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
        </div>

        <div className="glass mt-10 rounded-2xl p-8">
          <h2 className="text-2xl text-primary">Personal Info</h2>
          <dl className="mt-5 grid gap-x-8 gap-y-4 md:grid-cols-2">
            {[
              ["Email", user.email], ["Mobile", user.mobile],
              ["Age", user.age], ["Gender", user.gender], ["Address", user.address || "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/40 pb-2">
                <dt className="text-sm uppercase tracking-wider text-muted-foreground">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`glass rounded-xl p-6 ${accent ? "border-primary shadow-red" : ""}`}>
      <Icon className="h-8 w-8 text-primary" />
      <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
