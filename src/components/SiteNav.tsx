import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Dumbbell, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { getSessionUser, isAdmin, logoutAdmin, logoutUser } from "@/lib/gym-store";

export function SiteNav() {
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState<any>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    async function check() {
      const u = await getSessionUser();
      setUser(u);
      setAdmin(isAdmin());
    }
    check();
  }, [location]);

  const handleLogout = async () => {
    if (admin) logoutAdmin();
    if (user) await logoutUser();
    setUser(null);
    setAdmin(false);
    navigate({ to: "/" });
  };

  const linkBase =
    "relative hover:text-primary transition-colors after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full";

  return (
    <header className="sticky top-0 z-50 glass animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="group flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary transition-transform duration-500 group-hover:rotate-[20deg] group-hover:scale-110" />
          <span className="text-2xl font-bold tracking-wider">
            IRON<span className="text-primary">FORGE</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-semibold uppercase tracking-wide">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }} className={linkBase}>
            Home
          </Link>

          {!user && !admin && (
            <>
              <Link to="/register" activeProps={{ className: "text-primary" }} className={linkBase}>
                Join
              </Link>
              <Link to="/login" activeProps={{ className: "text-primary" }} className={linkBase}>
                Login
              </Link>
            </>
          )}

          {user && !admin && (
            <Link to="/dashboard" activeProps={{ className: "text-primary" }} className={`${linkBase} flex items-center gap-1.5`}>
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          )}

          {admin && (
            <Link to="/admin/dashboard" activeProps={{ className: "text-primary" }} className={`${linkBase} flex items-center gap-1.5`}>
              <Shield className="h-4 w-4" /> Admin Panel
            </Link>
          )}

          {(user || admin) && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs uppercase tracking-widest text-primary transition-all hover:scale-105 hover:bg-primary/20 hover:shadow-red active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
