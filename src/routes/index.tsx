import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { Dumbbell, Flame, Trophy, Users } from "lucide-react";
import gymBg from "@/assets/gym-bg.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IRONFORGE — Forge Your Body. Forge Your Mind." },
      { name: "description", content: "Join IRONFORGE Gym. Premium memberships, expert coaching, and a community built on iron." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <section className="relative isolate overflow-hidden">
        <img src={gymBg} alt="" width={1920} height={1280} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/60 via-background/80 to-background" />

        <div className="mx-auto flex max-w-6xl flex-col items-start px-6 py-32 md:py-44">
          <span className="fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary pulse-glow">
            <Flame className="h-3.5 w-3.5 animate-pulse" /> No Excuses. Only Reps.
          </span>
          <h1 className="fade-up max-w-3xl text-6xl font-bold leading-[0.95] md:text-8xl" style={{ animationDelay: ".1s" }}>
            Forge Your <span className="text-shimmer">Body.</span><br />
            Forge Your <span className="text-shimmer">Mind.</span>
          </h1>
          <p className="fade-up mt-6 max-w-xl text-lg text-muted-foreground" style={{ animationDelay: ".2s" }}>
            Where iron meets ambition. Train with the best equipment, dedicated coaches,
            and a community that pushes you past every limit.
          </p>
          <div className="fade-up mt-10 flex flex-wrap gap-4" style={{ animationDelay: ".3s" }}>
            <Button asChild size="lg" className="bg-gradient-red shadow-red text-base font-bold uppercase tracking-wider transition-transform hover:opacity-90 hover:scale-105 active:scale-95">
              <Link to="/register"><Dumbbell className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" /> Become a Member</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary/40 text-base font-bold uppercase tracking-wider transition-transform hover:bg-primary/10 hover:scale-105 active:scale-95">
              <Link to="/login">Member Login</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Trophy, title: "Elite Coaching", desc: "Certified trainers crafting plans for every body." },
            { icon: Dumbbell, title: "Premium Gear", desc: "Industry-leading equipment, 24/7 access." },
            { icon: Users, title: "Iron Community", desc: "Train with people who share your hunger." },
          ].map((f, i) => (
            <div
              key={f.title}
              className="glass group fade-up hover-lift rounded-xl p-8"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <f.icon className="h-10 w-10 text-primary transition-transform duration-500 group-hover:rotate-[15deg] group-hover:scale-110" />
              <h3 className="mt-5 text-2xl">{f.title}</h3>
              <p className="mt-2 text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: "Monthly", price: "$39", per: "/ month", perks: ["Full gym access", "Locker room", "Free trial class"] },
            { name: "Quarterly", price: "$99", per: "/ 3 months", perks: ["Everything in Monthly", "1 PT session", "Save 15%"], featured: true },
            { name: "Yearly", price: "$349", per: "/ year", perks: ["Everything in Quarterly", "4 PT sessions", "Save 25%"] },
          ].map((p, i) => (
            <div
              key={p.name}
              className={`glass fade-up hover-lift rounded-xl p-8 ${p.featured ? "border-primary shadow-red md:-translate-y-2" : ""}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {p.featured && <span className="mb-3 inline-block rounded-full bg-gradient-red px-3 py-1 text-xs font-bold uppercase pulse-glow">Most Popular</span>}
              <h3 className="text-3xl">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-gradient-red">{p.price}</span>
                <span className="text-muted-foreground">{p.per}</span>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                {p.perks.map((perk) => <li key={perk} className="flex gap-2"><span className="text-primary">▸</span> {perk}</li>)}
              </ul>
              <Button asChild className="mt-8 w-full bg-gradient-red font-bold uppercase tracking-wider transition-transform hover:scale-105 active:scale-95"><Link to="/register">Start Now</Link></Button>
            </div>
          ))}
        </div>
      </section>


      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} IRONFORGE Gym. Built to lift heavier.
      </footer>
    </div>
  );
}
