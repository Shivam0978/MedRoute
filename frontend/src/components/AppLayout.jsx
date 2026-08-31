import { Link, NavLink, useLocation, Outlet } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Stethoscope,
  CalendarCheck,
  Siren,
  Bot,
  Droplet,
  Pill,
  Landmark,
  FileHeart,
  LogIn,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Languages,
  MapPin,
  Plus,
  LifeBuoy,
  Shield,
  ChevronDown,
  ChevronRight,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { I18nContext, dict } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isAdmin } from "@/lib/admin";

// Primary links for Desktop Navbar (Streamlined & space-efficient)
const PRIMARY_NAV = [
  { to: "/hospitals", labelKey: "hospitals", icon: Stethoscope },
  { to: "/nearby", labelKey: "nearby", icon: MapPin },
  { to: "/doctors", labelKey: "doctors", icon: Stethoscope },
  { to: "/appointments", labelKey: "appointments", icon: CalendarCheck },
  { to: "/ai-assistant", labelKey: "ai", icon: Bot, badge: "AI" },
];

// Secondary services in the "More" dropdown
const SECONDARY_NAV = [
  { to: "/blood-bank", labelKey: "blood", icon: Droplet, desc: "Blood availability & donors" },
  { to: "/pharmacy", labelKey: "pharmacy", icon: Pill, desc: "24x7 stock & delivery" },
  { to: "/schemes", labelKey: "schemes", icon: Landmark, desc: "Ayushman Bharat & PMSSY" },
  { to: "/records", labelKey: "records", icon: FileHeart, desc: "Prescriptions & reports" },
  { to: "/help", labelKey: "help", icon: LifeBuoy, desc: "FAQ & admin contact" },
];

// Full list for the mobile drawer
const ALL_MOBILE_NAV = [
  { to: "/", labelKey: "home", icon: Activity, group: "core" },
  { to: "/hospitals", labelKey: "hospitals", icon: Stethoscope, group: "core" },
  { to: "/nearby", labelKey: "nearby", icon: MapPin, group: "core" },
  { to: "/doctors", labelKey: "doctors", icon: Stethoscope, group: "core" },
  { to: "/appointments", labelKey: "appointments", icon: CalendarCheck, group: "core" },
  { to: "/ai-assistant", labelKey: "ai", icon: Bot, badge: "AI", group: "core" },
  { to: "/blood-bank", labelKey: "blood", icon: Droplet, group: "resources" },
  { to: "/pharmacy", labelKey: "pharmacy", icon: Pill, group: "resources" },
  { to: "/schemes", labelKey: "schemes", icon: Landmark, group: "resources" },
  { to: "/records", labelKey: "records", icon: FileHeart, group: "resources" },
  { to: "/help", labelKey: "help", icon: LifeBuoy, group: "resources" },
];

export function AppLayout() {
  const { user, signOut } = useAuth();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("en");

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Initialize theme and language from storage
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("mr-theme") : null;
    if (stored === "dark" || (!stored && window.matchMedia?.("(prefers-color-scheme: dark)").matches)) {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
    const l = typeof window !== "undefined" && localStorage.getItem("mr-lang");
    if (l) setLang(l);
  }, []);

  const toggleTheme = () => {
    setDark((d) => {
      const nd = !d;
      document.documentElement.classList.toggle("dark", nd);
      localStorage.setItem("mr-theme", nd ? "dark" : "light");
      return nd;
    });
  };

  const setLangP = (l) => {
    setLang(l);
    localStorage.setItem("mr-lang", l);
  };

  const t = useMemo(() => (k) => dict[lang]?.[k] ?? k, [lang]);
  const isUserAdmin = isAdmin(user);

  return (
    <I18nContext.Provider value={{ lang, setLang: setLangP, t }}>
      <div className="min-h-screen flex flex-col selection:bg-primary/20 bg-background text-foreground transition-colors duration-200">
        {/* ================= DESKTOP & MOBILE HEADER ================= */}
        <header className="sticky top-0 z-40 w-full bg-background/85 backdrop-blur-xl border-b border-border/50 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between gap-4">
            
            {/* Logo (Acts as Home Link) */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group focus:outline-none">
              <div className="size-10 rounded-2xl gradient-primary grid place-items-center shadow-soft shrink-0 group-hover:scale-105 transition-transform duration-200">
                <Activity className="size-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                  MediRoute
                </span>
                <span className="text-[10px] font-bold text-primary tracking-wider uppercase -mt-1 hidden sm:block">
                  Smart Care Navigator
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (xl+ screens) */}
            <nav className="hidden xl:flex items-center gap-1.5 shrink-0">
              {PRIMARY_NAV.map((n) => {
                const Icon = n.icon;
                return (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    className={({ isActive }) =>
                      `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                        isActive
                          ? "text-primary bg-primary/10 font-bold shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`
                    }
                  >
                    <Icon className="size-4 opacity-80" />
                    <span>{t(n.labelKey)}</span>
                    {n.badge && (
                      <span className="px-1.5 py-0.2 rounded-md bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                        {n.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}

              {/* "More" Services Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="px-3.5 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 inline-flex items-center gap-1 cursor-pointer outline-none whitespace-nowrap">
                  <span>More</span>
                  <ChevronDown className="size-4 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-64 z-50 bg-popover/95 backdrop-blur-xl border border-border/60 shadow-xl rounded-2xl p-2 animate-in fade-in-50 zoom-in-95"
                >
                  <div className="px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Additional Services
                  </div>
                  {SECONDARY_NAV.map((n) => {
                    const Icon = n.icon;
                    return (
                      <DropdownMenuItem key={n.to} asChild className="rounded-xl p-2.5 focus:bg-primary/10 cursor-pointer">
                        <Link to={n.to} className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                            <Icon className="size-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm leading-tight">{t(n.labelKey)}</div>
                            <div className="text-[11px] text-muted-foreground">{n.desc}</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem asChild className="rounded-xl p-2.5 focus:bg-primary/10 cursor-pointer">
                    <Link to="/submit-hospital" className="flex items-center gap-3 text-primary font-bold text-sm">
                      <div className="size-8 rounded-lg bg-primary/15 text-primary grid place-items-center shrink-0">
                        <Plus className="size-4" />
                      </div>
                      <div>
                        <div>Add Facility</div>
                        <div className="text-[11px] text-muted-foreground font-normal">Submit a new hospital</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* SOS Emergency Button */}
              <Link
                to="/emergency"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl gradient-emergency text-emergency-foreground text-xs sm:text-sm font-bold shadow-soft hover:opacity-95 transition-all hover-lift whitespace-nowrap"
              >
                <Siren className="size-4 animate-pulse" />
                <span>SOS <span className="hidden sm:inline font-mono">(102)</span></span>
              </Link>

              {/* Theme & Language Toggles (Desktop) */}
              <div className="hidden sm:flex items-center bg-muted/60 rounded-xl p-1 border border-border/50">
                <button
                  onClick={() => setLangP(lang === "en" ? "hi" : "en")}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-background text-xs font-bold text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5"
                  title="Switch Language"
                >
                  <Languages className="size-3.5" />
                  <span>{lang === "en" ? "HI" : "EN"}</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-all"
                  title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  aria-label="Toggle theme"
                >
                  {dark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
                </button>
              </div>

              {/* User Account / Login Button */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-border/60 bg-card hover:bg-muted/60 transition-all shadow-xs cursor-pointer outline-none">
                    <span className="size-8 rounded-full gradient-primary grid place-items-center text-primary-foreground text-xs font-bold shrink-0 shadow-soft">
                      {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden md:block text-xs font-semibold truncate max-w-[100px]">
                      {user.full_name || user.email?.split("@")[0]}
                    </span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-64 z-50 bg-popover/95 backdrop-blur-xl border border-border/60 shadow-xl rounded-2xl p-2 animate-in fade-in-50"
                  >
                    <div className="px-3 py-2 bg-muted/40 rounded-xl mb-1.5">
                      <div className="font-bold text-sm truncate">{user.full_name || "Account"}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    </div>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-2.5">
                      <Link to="/records" className="flex items-center gap-3">
                        <FileHeart className="size-4 text-primary" />
                        <span className="font-medium text-sm">{t("records")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-2.5">
                      <Link to="/appointments" className="flex items-center gap-3">
                        <CalendarCheck className="size-4 text-primary" />
                        <span className="font-medium text-sm">{t("appointments")}</span>
                      </Link>
                    </DropdownMenuItem>
                    {isUserAdmin && (
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-2.5 bg-primary/10 text-primary font-bold mt-1">
                        <Link to="/admin" className="flex items-center gap-3">
                          <Shield className="size-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="my-1.5" />
                    <DropdownMenuItem
                      onClick={signOut}
                      className="flex items-center gap-3 cursor-pointer rounded-xl p-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive text-sm font-medium"
                    >
                      <LogOut className="size-4" />
                      <span>{t("logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button size="sm" className="rounded-xl shadow-soft font-bold hover-lift px-4">
                    <LogIn className="size-4 mr-1.5" />
                    <span>{t("login")}</span>
                  </Button>
                </Link>
              )}

              {/* Hamburger Button (Shown below xl screen width) */}
              <button
                className="xl:hidden size-10 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all shadow-xs"
                onClick={() => setOpen((o) => !o)}
                aria-label="Toggle navigation menu"
                aria-expanded={open}
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* ================= HIGH-EFFICIENCY MOBILE DRAWER ================= */}
        {/* Backdrop Overlay */}
        <div
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 xl:hidden ${
            open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />

        {/* Slide-in Mobile Menu Panel */}
        <aside
          className={`fixed top-0 right-0 z-50 w-full sm:w-[380px] h-full bg-background/95 backdrop-blur-2xl border-l border-border/60 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out xl:hidden ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          aria-label="Mobile Navigation Menu"
        >
          {/* Drawer Top Bar */}
          <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
            <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
              <div className="size-8 rounded-xl gradient-primary grid place-items-center shadow-soft">
                <Activity className="size-4 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-extrabold tracking-tight">MediRoute</span>
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="size-9 rounded-xl bg-muted/80 hover:bg-muted border border-border/50 grid place-items-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            
            {/* Quick SOS Action Card */}
            <div className="p-3.5 rounded-2xl gradient-emergency text-emergency-foreground shadow-soft flex items-center justify-between">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider opacity-90">Medical Emergency</div>
                <div className="font-display text-lg font-black">Need Urgent Help?</div>
              </div>
              <a
                href="tel:102"
                className="px-3.5 py-2 rounded-xl bg-white text-emergency font-black text-sm shadow-md hover:bg-white/90 transition-all flex items-center gap-1.5"
              >
                <PhoneCall className="size-4" /> 102
              </a>
            </div>

            {/* Core Navigation Section */}
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                Core Services
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {ALL_MOBILE_NAV.filter((n) => n.group === "core").map((n) => {
                  const Icon = n.icon;
                  const active = loc.pathname === n.to;
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        active
                          ? "bg-primary/10 text-primary font-bold shadow-xs border border-primary/20"
                          : "text-foreground hover:bg-muted/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-8 rounded-lg grid place-items-center ${
                            active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="size-4" />
                        </div>
                        <span>{t(n.labelKey)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {n.badge && (
                          <span className="px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-black uppercase">
                            {n.badge}
                          </span>
                        )}
                        <ChevronRight className="size-4 text-muted-foreground/60" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Healthcare Resources Section */}
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                Health Resources
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {ALL_MOBILE_NAV.filter((n) => n.group === "resources").map((n) => {
                  const Icon = n.icon;
                  const active = loc.pathname === n.to;
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-primary/10 text-primary font-bold shadow-xs border border-primary/20"
                          : "text-foreground hover:bg-muted/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-8 rounded-lg grid place-items-center ${
                            active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="size-4" />
                        </div>
                        <span>{t(n.labelKey)}</span>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground/60" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Add Facility & Admin Shortcuts */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <Link
                to="/submit-hospital"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm transition-colors border border-primary/20 shadow-xs"
              >
                <Plus className="size-4" />
                <span>Submit New Hospital</span>
              </Link>
              {isUserAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-soft"
                >
                  <Shield className="size-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
            </div>
          </div>

          {/* Drawer Footer Controls */}
          <div className="p-4 border-t border-border/50 bg-card/60 space-y-3">
            
            {/* Language & Theme Switcher Bar */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLangP(lang === "en" ? "hi" : "en")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-muted/80 hover:bg-muted text-xs font-bold border border-border/40 transition-colors"
              >
                <Languages className="size-4 text-primary" />
                <span>{lang === "en" ? "हिंदी में बदलें" : "English"}</span>
              </button>
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-muted/80 hover:bg-muted text-xs font-bold border border-border/40 transition-colors"
              >
                {dark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-primary" />}
                <span>{dark ? "Light Mode" : "Dark Mode"}</span>
              </button>
            </div>

            {/* User Session Footer Card */}
            {user ? (
              <div className="p-3 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <div className="size-8 rounded-full gradient-primary grid place-items-center text-primary-foreground text-xs font-bold shrink-0">
                    {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold truncate">{user.full_name || "My Account"}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                  title="Log Out"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="block">
                <Button className="w-full rounded-xl font-bold shadow-soft py-2.5">
                  <LogIn className="size-4 mr-2" />
                  Sign In to Account
                </Button>
              </Link>
            )}
          </div>
        </aside>

        {/* ================= PAGE BODY CONTENT ================= */}
        <main className="flex-1 relative">
          <Outlet />
        </main>

        {/* ================= FOOTER ================= */}
        <footer className="mt-20 border-t border-border/50 bg-card relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 py-16 grid sm:grid-cols-4 gap-10 text-sm relative z-10">
            <div className="sm:col-span-2 pr-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl gradient-primary grid place-items-center shadow-soft">
                  <Activity className="size-5 text-primary-foreground" />
                </div>
                <span className="font-display text-2xl font-extrabold tracking-tight">MediRoute</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-base">
                The next-generation healthcare navigation platform. Find the right hospitals, top-rated doctors,
                live bed availability, and emergency assistance in seconds.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/hospitals">
                  <Button variant="outline" className="rounded-xl border-border/50 bg-background/50 backdrop-blur">
                    Find Hospitals
                  </Button>
                </Link>
                <Link to="/emergency">
                  <Button variant="outline" className="rounded-xl border-border/50 bg-background/50 backdrop-blur text-emergency">
                    Emergency Helplines
                  </Button>
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Platform</h4>
              <ul className="space-y-3 text-muted-foreground font-medium">
                <li>
                  <Link to="/hospitals" className="hover:text-primary transition-colors flex items-center gap-2">
                    <MapPin className="size-3.5" /> Find Hospitals
                  </Link>
                </li>
                <li>
                  <Link to="/doctors" className="hover:text-primary transition-colors flex items-center gap-2">
                    <Stethoscope className="size-3.5" /> Book Doctors
                  </Link>
                </li>
                <li>
                  <Link to="/ai-assistant" className="hover:text-primary transition-colors flex items-center gap-2">
                    <Bot className="size-3.5" /> AI Triage
                  </Link>
                </li>
                <li>
                  <Link to="/schemes" className="hover:text-primary transition-colors flex items-center gap-2">
                    <Landmark className="size-3.5" /> Govt Schemes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Emergency</h4>
              <p className="text-muted-foreground mb-4 text-xs leading-relaxed">
                MediRoute provides general guidance. In severe emergencies, always call 102 immediately.
              </p>
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-center shadow-xs">
                <div className="text-destructive font-extrabold text-xl mb-1">Dial 102</div>
                <div className="text-xs text-destructive/80 font-semibold uppercase tracking-wider">National Ambulance</div>
              </div>
            </div>
          </div>
          <div className="border-t border-border/50 py-6 text-center text-sm font-medium text-muted-foreground bg-muted/20 relative z-10">
            © {new Date().getFullYear()} MediRoute. All rights reserved.
          </div>
        </footer>
      </div>
    </I18nContext.Provider>
  );
}