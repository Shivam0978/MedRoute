import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Search, Mic, Stethoscope, Bot, Siren, Droplet, Bed, Pill, Landmark, FileHeart, MapPin, Star, Languages, ShieldCheck, Activity, ArrowRight, Baby, Heart, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  const nav = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    nav(`/hospitals?q=${encodeURIComponent(q.trim())}`);
  };

  const voice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice search not supported in this browser.");
    const r = new SR();
    r.lang = "en-IN";
    r.start();
    r.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setQ(t);
      nav(`/hospitals?q=${encodeURIComponent(t)}`);
    };
  };

  const features = [
    { icon: Search, title: "Smart Search", desc: "Search by hospital, disease, symptom, doctor or location.", to: "/hospitals", color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: MapPin, title: "Nearby Hospitals", desc: "Discover hospitals around you with travel time and directions.", to: "/nearby", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: Siren, title: "Emergency SOS", desc: "Ambulance, blood, ER hospitals and helplines in one tap.", to: "/emergency", color: "text-rose-500", bg: "bg-rose-500/10" },
    { icon: Stethoscope, title: "Specialization Filter", desc: "Find Cardiologists, Pediatricians, Dentists, and more.", to: "/doctors", color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { icon: Bot, title: "AI Symptom Assistant", desc: "Describe your symptoms — get triage guidance instantly.", to: "/ai-assistant", color: "text-purple-500", bg: "bg-purple-500/10" },
    { icon: Bed, title: "Live Bed Availability", desc: "ICU, oxygen, emergency and general beds updated live.", to: "/hospitals", color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { icon: Droplet, title: "Blood Bank & Donors", desc: "Find blood by group and city. Become a donor to save lives.", to: "/blood-bank", color: "text-red-500", bg: "bg-red-500/10" },
    { icon: Pill, title: "Medicine & Pharmacy", desc: "24x7 pharmacies and home delivery for emergency medicines.", to: "/pharmacy", color: "text-teal-500", bg: "bg-teal-500/10" },
    { icon: Landmark, title: "Govt Schemes", desc: "Ayushman Bharat & free treatment programs information.", to: "/schemes", color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: FileHeart, title: "Health Records", desc: "Store prescriptions and reports securely in one place.", to: "/records", color: "text-sky-500", bg: "bg-sky-500/10" },
    { icon: Baby, title: "Women & Child", desc: "Maternity, pediatric and vaccination quick access.", to: "/hospitals", color: "text-pink-500", bg: "bg-pink-500/10" },
    { icon: Languages, title: "Multilingual", desc: "Switch between English and हिन्दी anytime seamlessly.", to: "/", color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* PREMIUM HERO */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 -z-20" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent -z-10 blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-accent/15 via-transparent to-transparent -z-10 blur-3xl opacity-60" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="size-4 animate-pulse" /> The Next-Gen Healthcare Platform
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Find care, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">faster.</span>
              <br />
              <span className="text-muted-foreground/80 font-semibold text-2xl sm:text-3xl lg:text-4xl">When seconds matter.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              MediRoute connects you to the right hospitals, top doctors, live bed availability, and emergency services instantly. Your lifeline in a crisis.
            </p>

            <form onSubmit={submit} className="relative flex items-center p-2 sm:p-3 bg-background/80 backdrop-blur-xl border border-border rounded-2xl sm:rounded-full shadow-glow max-w-3xl animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 group focus-within:border-primary/50 transition-colors">
              <Search className="size-6 text-primary ml-4 mr-3" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search 'Cardiologist', 'ICU bed in Mumbai', 'Chest pain'..."
                className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground/70 font-medium"
              />
              <div className="flex items-center gap-2 pr-2">
                <button type="button" onClick={voice} className="p-3 rounded-full hover:bg-muted text-muted-foreground transition-colors group-focus-within:text-primary" aria-label="Voice search">
                  <Mic className="size-5" />
                </button>
                <Button type="submit" size="lg" className="rounded-full px-8 text-base shadow-soft hover-lift">Search</Button>
              </div>
            </form>

            <div className="mt-8 flex flex-wrap items-center gap-2 text-base animate-in fade-in duration-700 delay-500">
              <span className="text-muted-foreground font-medium py-1.5 mr-2">Trending:</span>
              {["Chest pain", "Pediatrician", "Dentist Bengaluru", "ICU bed", "Blood O+"].map((s) => (
                <button key={s} onClick={() => nav(`/hospitals?q=${encodeURIComponent(s)}`)} className="px-4 py-1.5 rounded-full border border-border/60 bg-card/50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary text-muted-foreground font-medium text-base transition-all hover-lift">
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap gap-4 animate-in fade-in duration-700 delay-700">
              <Link to="/emergency"><Button size="lg" className="rounded-xl gradient-emergency text-emergency-foreground font-bold shadow-soft hover-lift text-base px-8 h-14"><Siren className="size-5 mr-2 animate-pulse" /> SOS Emergency</Button></Link>
              <Link to="/ai-assistant"><Button variant="outline" size="lg" className="rounded-xl border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-bold hover-lift text-base px-8 h-14"><Bot className="size-5 mr-2" /> AI Triage Assistant</Button></Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative hidden lg:block animate-in zoom-in-95 fade-in duration-1000 delay-300">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-70" />
            
            <div className="relative rounded-[2rem] overflow-hidden border border-border/50 shadow-2xl glass-card aspect-[4/5] transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <img src="https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=800&q=80" alt="Hospital interior" className="w-full h-full object-cover object-center opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            </div>

            {/* Floating Badges */}
            <div className="absolute -left-12 top-20 flex items-center gap-4 px-5 py-4 rounded-2xl glass-card shadow-soft hover-lift cursor-default animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="size-12 rounded-xl bg-success/20 grid place-items-center"><Bed className="size-6 text-success" /></div>
              <div>
                <div className="text-sm text-muted-foreground font-semibold">Live Beds</div>
                <div className="font-extrabold text-xl text-foreground">142 Available</div>
              </div>
            </div>

            <div className="absolute -right-8 bottom-32 flex items-center gap-4 px-5 py-4 rounded-2xl glass-card shadow-soft hover-lift cursor-default animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              <div className="size-12 rounded-xl bg-primary/20 grid place-items-center"><Star className="size-6 text-primary" /></div>
              <div>
                <div className="text-sm text-muted-foreground font-semibold">Top Doctors</div>
                <div className="font-extrabold text-xl text-foreground">4.9 / 5.0</div>
              </div>
            </div>
            
            <div className="absolute left-1/2 -bottom-6 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full gradient-emergency text-emergency-foreground shadow-glow hover-lift cursor-default">
              <Zap className="size-4 animate-pulse" />
              <span className="font-bold text-sm">Response Time: &lt; 3 mins</span>
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM FEATURES */}
      <section className="relative py-24 bg-muted/30 border-y border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/3 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">A complete healthcare ecosystem</h2>
            <p className="text-lg text-muted-foreground">Everything you need to manage your health, find immediate care, and save lives—all in one intelligent platform.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Link key={f.title} to={f.to} className="group relative p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/50 shadow-sm hover:shadow-soft transition-all duration-300 hover-lift overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                  <div className={`size-14 rounded-2xl ${f.bg} grid place-items-center mb-6 shadow-inner`}>
                    <Icon className={`size-7 ${f.color}`} />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground flex items-center justify-between">
                    {f.title}
                    <ArrowRight className="size-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRUST & METRICS */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-6 leading-tight">Built on trust, driven by care.</h2>
            <p className="text-lg text-muted-foreground mb-8">MediRoute partners with top-tier hospitals and verified medical professionals to ensure you receive the highest standard of care, exactly when you need it.</p>
            
            <div className="space-y-6">
              {[
                { icon: ShieldCheck, t: "100% Verified Directory", d: "Every hospital and doctor is rigorously vetted and verified." },
                { icon: Activity, t: "Real-time Data Integration", d: "Live syncing with hospital APIs for accurate bed and blood availability." },
                { icon: Heart, t: "Patient-First Design", d: "Zero clutter. Built specifically for high-stress, urgent situations." },
              ].map((x) => {
                const Icon = x.icon;
                return (
                  <div key={x.t} className="flex gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                    <div className="size-12 rounded-xl bg-primary/10 grid place-items-center shrink-0 border border-primary/20"><Icon className="size-6 text-primary" /></div>
                    <div>
                      <div className="font-bold text-foreground text-lg">{x.t}</div>
                      <div className="text-muted-foreground mt-1">{x.d}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4 pt-12">
              <div className="p-8 rounded-3xl glass-card text-center shadow-soft">
                <div className="text-4xl font-display font-extrabold text-primary mb-2">5,000+</div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Hospitals</div>
              </div>
              <div className="p-8 rounded-3xl glass-card text-center shadow-soft">
                <div className="text-4xl font-display font-extrabold text-accent mb-2">12k+</div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Doctors</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-8 rounded-3xl glass-card text-center shadow-soft">
                <div className="text-4xl font-display font-extrabold text-success mb-2">1M+</div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Patients Helped</div>
              </div>
              <div className="p-8 rounded-3xl glass-card text-center shadow-soft bg-primary text-primary-foreground border-none">
                <div className="text-4xl font-display font-extrabold mb-2">&lt; 3m</div>
                <div className="text-sm font-semibold text-primary-foreground/80 uppercase tracking-wider">SOS Response</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}