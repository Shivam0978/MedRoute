import { Link, useLocation, Outlet } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Activity, Stethoscope, CalendarCheck, Siren, Bot, Droplet, Pill, Landmark, FileHeart, LogIn, LogOut, Menu, X, Moon, Sun, Languages, MapPin, Plus, LifeBuoy, Shield, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { I18nContext, dict } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { isAdmin } from "@/lib/admin";

const NAV = [
{ to: "/", labelKey: "home", icon: Activity },
{ to: "/hospitals", labelKey: "hospitals", icon: Stethoscope },
{ to: "/nearby", labelKey: "nearby", icon: MapPin },
{ to: "/doctors", labelKey: "doctors", icon: Stethoscope },
{ to: "/appointments", labelKey: "appointments", icon: CalendarCheck },
{ to: "/ai-assistant", labelKey: "ai", icon: Bot },
{ to: "/blood-bank", labelKey: "blood", icon: Droplet },
{ to: "/pharmacy", labelKey: "pharmacy", icon: Pill },
{ to: "/schemes", labelKey: "schemes", icon: Landmark },
{ to: "/records", labelKey: "records", icon: FileHeart },
{ to: "/help", labelKey: "help", icon: LifeBuoy }];


const PRIMARY_NAV = NAV.slice(0, 6);
const SECONDARY_NAV = NAV.slice(6);


export function AppLayout() {
  const { user, signOut } = useAuth();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("en");

  useEffect(() => {setOpen(false);}, [loc.pathname]);
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("mr-theme") : null;
    if (stored === "dark") {setDark(true);document.documentElement.classList.add("dark");}
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
  const setLangP = (l) => {setLang(l);localStorage.setItem("mr-lang", l);};

  const t = useMemo(() => (k) => dict[lang][k] ?? k, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang: setLangP, t }}>
      <div className="min-h-screen flex flex-col selection:bg-primary/20">
        <header className="sticky top-0 z-50 glass border-b border-border/50 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 h-20 flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 shrink-0 hover:opacity-90 transition-opacity">
              <div className="size-10 rounded-xl gradient-primary grid place-items-center shadow-soft shrink-0">
                <Activity className="size-5 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">MediRoute</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 flex-1 min-w-0 justify-center overflow-hidden">
              {PRIMARY_NAV.map((n) =>
              <Link
                key={n.to}
                to={n.to}
                className="px-3 xl:px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 whitespace-nowrap"
                activeProps={{ className: "px-3 xl:px-4 py-2.5 rounded-xl text-sm font-bold text-primary bg-primary/10 whitespace-nowrap shadow-inner" }}
                activeOptions={{ exact: n.to === "/" }}>
                
                  {t(n.labelKey)}
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger className="px-3 xl:px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 whitespace-nowrap inline-flex items-center gap-1">
                  More <ChevronDown className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-50 bg-popover/95 backdrop-blur-lg border-border/50 shadow-soft rounded-2xl p-2">
                  {SECONDARY_NAV.map((n) => {
                    const Icon = n.icon;
                    return (
                      <DropdownMenuItem key={n.to} asChild className="rounded-xl focus:bg-primary/10 focus:text-primary cursor-pointer p-2.5">
                        <Link to={n.to} className="flex items-center gap-3">
                          <Icon className="size-4.5 text-primary" /> <span className="font-medium">{t(n.labelKey)}</span>
                        </Link>
                      </DropdownMenuItem>);

                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
              <Link to="/emergency" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-emergency text-emergency-foreground text-sm font-bold shadow-soft hover:opacity-90 transition-all hover-lift whitespace-nowrap">
                <Siren className="size-4.5 animate-pulse" /> SOS
              </Link>
              <div className="hidden sm:flex items-center bg-muted/50 rounded-xl p-1 border border-border/50">
                <button onClick={() => setLangP(lang === "en" ? "hi" : "en")} className="p-2 rounded-lg hover:bg-background hover:shadow-sm text-muted-foreground transition-all" aria-label="Language">
                  <Languages className="size-4.5" />
                </button>
                <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-background hover:shadow-sm text-muted-foreground transition-all" aria-label="Theme">
                  {dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
                </button>
              </div>

              {user ?
              <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border/50 bg-card hover:bg-muted/50 transition-all shadow-sm max-w-[210px]">
                    <span className="size-8 rounded-full gradient-primary grid place-items-center text-primary-foreground text-sm font-bold shrink-0 shadow-soft">
                      {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden md:block text-sm font-medium truncate max-w-[120px]">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                    <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 z-50 bg-popover/95 backdrop-blur-lg border-border/50 shadow-soft rounded-2xl p-2">
                    <div className="px-3 py-2 text-xs text-muted-foreground truncate font-medium bg-muted/30 rounded-xl mb-2">{user.email}</div>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-2.5">
                      <Link to="/records" className="flex items-center gap-3"><FileHeart className="size-4.5 text-primary" /> <span className="font-medium">{t("records")}</span></Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-2.5">
                      <Link to="/appointments" className="flex items-center gap-3"><CalendarCheck className="size-4.5 text-primary" /> <span className="font-medium">{t("appointments")}</span></Link>
                    </DropdownMenuItem>
                    {isAdmin(user?.email) &&
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-2.5 bg-primary/5 mt-1">
                        <Link to="/admin" className="flex items-center gap-3 text-primary"><Shield className="size-4.5" /> <span className="font-bold">Admin</span></Link>
                      </DropdownMenuItem>
                  }
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem onClick={signOut} className="flex items-center gap-3 cursor-pointer rounded-xl p-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <LogOut className="size-4.5" /> <span className="font-medium">{t("logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu> :

              <Link to="/login">
                  <Button size="default" className="whitespace-nowrap rounded-xl shadow-soft font-bold hover-lift"><LogIn className="size-4 sm:mr-2" /><span className="hidden sm:inline">{t("login")}</span></Button>
                </Link>
              }

              <button className="lg:hidden p-2 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted transition-colors" onClick={() => setOpen((o) => !o)} aria-label="Menu">
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>


          {open &&
          <div className="xl:hidden border-t border-border/50 glass">
              <div className="px-4 py-4 grid grid-cols-2 gap-2 max-h-[70vh] overflow-y-auto">
                {NAV.map((n) => {
                const Icon = n.icon;
                return (
                  <Link key={n.to} to={n.to} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-card border border-border/30 hover:border-primary/30 hover:shadow-sm transition-all">
                      <Icon className="size-4.5 text-primary" />{t(n.labelKey)}
                    </Link>);

              })}
                <Link to="/submit-hospital" className="col-span-2 mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm transition-colors border border-primary/20">
                  <Plus className="size-5" /> Add a hospital
                </Link>
                {isAdmin(user?.email) &&
              <Link to="/admin" className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-soft">
                    <Shield className="size-5" /> Admin Dashboard
                  </Link>
              }
                <Link to="/emergency" className="col-span-2 mt-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl gradient-emergency text-emergency-foreground font-bold shadow-soft">
                  <Siren className="size-5 animate-pulse" /> Emergency SOS
                </Link>
                <div className="col-span-2 flex gap-2 mt-2">
                  <button onClick={() => setLangP(lang === "en" ? "hi" : "en")} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-muted text-sm font-medium">
                    <Languages className="size-4" /> {lang === "en" ? "हिंदी" : "English"}
                  </button>
                  <button onClick={toggleTheme} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-muted text-sm font-medium">
                    {dark ? <Sun className="size-4" /> : <Moon className="size-4" />} {dark ? "Light" : "Dark"}
                  </button>
                </div>
              </div>
            </div>
          }
        </header>

        <main className="flex-1 relative">
          <Outlet />
        </main>

        <footer className="mt-20 border-t border-border/50 bg-card relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 py-16 grid sm:grid-cols-4 gap-10 text-sm relative z-10">
            <div className="sm:col-span-2 pr-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl gradient-primary grid place-items-center shadow-soft"><Activity className="size-5 text-primary-foreground" /></div>
                <span className="font-display text-2xl font-extrabold tracking-tight">MediRoute</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-base">The next-generation healthcare navigation platform. Find the right hospitals, top-rated doctors, live bed availability, and emergency assistance in seconds.</p>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="rounded-xl border-border/50 bg-background/50 backdrop-blur">Download App</Button>
                <Button variant="outline" className="rounded-xl border-border/50 bg-background/50 backdrop-blur">Contact Us</Button>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Platform</h4>
              <ul className="space-y-3 text-muted-foreground font-medium">
                <li><Link to="/hospitals" className="hover:text-primary transition-colors flex items-center gap-2"><MapPin className="size-3.5" /> Find Hospitals</Link></li>
                <li><Link to="/doctors" className="hover:text-primary transition-colors flex items-center gap-2"><Stethoscope className="size-3.5" /> Book Doctors</Link></li>
                <li><Link to="/ai-assistant" className="hover:text-primary transition-colors flex items-center gap-2"><Bot className="size-3.5" /> AI Triage</Link></li>
                <li><Link to="/schemes" className="hover:text-primary transition-colors flex items-center gap-2"><Landmark className="size-3.5" /> Govt Schemes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Emergency</h4>
              <p className="text-muted-foreground mb-4 text-xs leading-relaxed">MediRoute provides general guidance. In severe emergencies, always rely on local authorities.</p>
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-center">
                <div className="text-destructive font-extrabold text-xl mb-1">Dial 102</div>
                <div className="text-xs text-destructive/80 font-semibold uppercase tracking-wider">For Ambulance</div>
              </div>
            </div>
          </div>
          <div className="border-t border-border/50 py-6 text-center text-sm font-medium text-muted-foreground bg-muted/20 relative z-10">
            © {new Date().getFullYear()} MediRoute. All rights reserved. Designed with precision.
          </div>
        </footer>
      </div>
    </I18nContext.Provider>);

}