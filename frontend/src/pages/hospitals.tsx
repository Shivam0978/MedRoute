import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import Fuse from "fuse.js";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Star, Bed, Stethoscope, IndianRupee, GitCompare, Filter, Plus, Clock, Navigation, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

// Symptom → specialty hints. Fuzzy-matched so typos still route correctly ("chst pian" → cardiology).
const SYMPTOM_HINTS: Record<string, string[]> = {
  "chest pain": ["Cardiology"], "heart attack": ["Cardiology"], "palpitations": ["Cardiology"], "high bp": ["Cardiology"], "hypertension": ["Cardiology"],
  "stroke": ["Neurology"], "headache": ["Neurology", "General Medicine"], "migraine": ["Neurology"], "seizure": ["Neurology"], "paralysis": ["Neurology"],
  "fracture": ["Orthopedics"], "bone pain": ["Orthopedics"], "back pain": ["Orthopedics"], "knee pain": ["Orthopedics"], "joint pain": ["Orthopedics"],
  "fever": ["General Medicine", "Pediatrics"], "cough": ["General Medicine"], "cold": ["General Medicine"], "diabetes": ["General Medicine"],
  "child fever": ["Pediatrics"], "baby vaccination": ["Pediatrics"], "infant": ["Pediatrics"], "newborn": ["Pediatrics"],
  "skin rash": ["Dermatology"], "acne": ["Dermatology"], "eczema": ["Dermatology"],
  "cancer": ["Oncology"], "tumor": ["Oncology"], "chemo": ["Oncology"],
  "tooth pain": ["Dental"], "gum bleeding": ["Dental"], "cavity": ["Dental"],
  "pregnancy": ["Gynaecology"], "delivery": ["Gynaecology"], "period pain": ["Gynaecology"],
  "ear pain": ["ENT"], "throat infection": ["ENT"], "hearing loss": ["ENT"],
  "eye pain": ["Ophthalmology"], "blurry vision": ["Ophthalmology"], "cataract": ["Ophthalmology"],
};

const schema = z.object({
  q: fallback(z.string(), "").default(""),
  city: fallback(z.string(), "").default(""),
  specialty: fallback(z.string(), "").default(""),
  govt: fallback(z.boolean(), false).default(false),
  emergency: fallback(z.boolean(), false).default(false),
});

export default HospitalsPage;

const SPECIALTIES = ["Cardiology","Neurology","Orthopedics","Pediatrics","Dermatology","Oncology","General Medicine","Dental"];
const CITIES = ["Mumbai","New Delhi","Bengaluru","Vellore","Anand"];

function HospitalsPage() {
  const [searchParams] = useSearchParams();
  const search = Object.fromEntries(searchParams.entries());
  const nav = useNavigate({ from: "/hospitals" });
  const [q, setQ] = useState(search.q);
  useEffect(() => setQ(search.q), [search.q]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12; // Adjusted for better grid layout

  const [compare, setCompare] = useState<string[]>([]);
  const toggleCompare = (id: string) => setCompare(c => c.includes(id) ? c.filter(x => x!==id) : c.length<3 ? [...c, id] : c);

  const { data: hospitals = [], isLoading } = useQuery({
    queryKey: ["hospitals"],
    queryFn: async () => {
      const resp = await fetch("http://localhost:3001/api/hospitals");
      if (!resp.ok) throw new Error("Failed");
      const data = await resp.json();
      return data;
    },
  });

  // Pre-filtered (city/specialty/flags) before fuzzy search
  const prefiltered = useMemo(() => {
    return (hospitals as any[]).filter((h) => {
      if (search.city && h.city !== search.city) return false;
      if (search.specialty && !(h.specialties || []).some((s: string) => s.toLowerCase().includes(search.specialty.toLowerCase()))) return false;
      if (search.govt && !h.is_government) return false;
      if (search.emergency && !h.emergency_24x7) return false;
      return true;
    });
  }, [hospitals, search.city, search.specialty, search.govt, search.emergency]);

  const fuse = useMemo(
    () =>
      new Fuse(prefiltered, {
        includeScore: true,
        threshold: 0.4, // typo tolerance
        ignoreLocation: true,
        keys: [
          { name: "name", weight: 0.5 },
          { name: "city", weight: 0.25 },
          { name: "address", weight: 0.1 },
          { name: "specialties", weight: 0.4 },
        ],
      }),
    [prefiltered],
  );

  const filtered = useMemo(() => {
    const raw = (search.q || "").trim();
    if (!raw) return prefiltered;

    // Symptom routing — fuzzy-match the query against known symptom phrases
    const hintFuse = new Fuse(Object.keys(SYMPTOM_HINTS), { threshold: 0.4, ignoreLocation: true });
    const hintMatches = hintFuse.search(raw.toLowerCase()).slice(0, 2);
    const hintedSpecs = hintMatches.flatMap((m) => SYMPTOM_HINTS[m.item]);

    const direct = fuse.search(raw).map((r) => r.item);
    if (hintedSpecs.length === 0) return direct;

    const specMatches = prefiltered.filter((h: any) =>
      (h.specialties || []).some((s: string) => hintedSpecs.some((hs) => s.toLowerCase().includes(hs.toLowerCase()))),
    );
    // Merge, dedupe, keep direct matches first
    const seen = new Set<string>();
    return [...direct, ...specMatches].filter((h: any) => (seen.has(h.id) ? false : (seen.add(h.id), true)));
  }, [fuse, prefiltered, search.q]);

  // Reset to page 1 whenever filters/query change
  useEffect(() => { setPage(1); }, [search.q, search.city, search.specialty, search.govt, search.emergency]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const update = (patch: Partial<typeof search>) =>
    nav({ search: (prev: typeof search) => ({ ...prev, ...patch }) });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-20">
      <div className="absolute top-0 right-0 w-3/4 h-1/2 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent -z-10 blur-3xl" />
      <div className="absolute top-1/2 left-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_center_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent -z-10 blur-3xl" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">Hospital Directory</h1>
            <p className="text-lg text-muted-foreground font-medium">Find the right care facility. Live bed updates & emergency details.</p>
          </div>
          <div className="flex gap-3 animate-in fade-in slide-in-from-right-8 duration-700">
            <Link to="/submit-hospital">
              <Button variant="outline" className="rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 shadow-sm transition-all hover-lift"><Plus className="size-4.5 mr-2" />Add facility</Button>
            </Link>
            {compare.length >= 2 && (
              <Link to="/compare" search={{ ids: compare.join(",") }}>
                <Button className="rounded-xl shadow-soft font-bold hover-lift animate-pulse-ring"><GitCompare className="size-4.5 mr-2" />Compare ({compare.length})</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-3 sm:p-5 shadow-soft mb-10 sticky top-24 z-30 animate-in fade-in slide-in-from-top-8 duration-700 delay-100 border border-border/50 backdrop-blur-xl">
          <form onSubmit={(e) => { e.preventDefault(); update({ q }); }} className="flex flex-wrap lg:flex-nowrap gap-3 items-center">
            <div className="flex-1 w-full lg:min-w-[320px] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-background border border-border/50 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm">
              <Search className="size-5 text-primary" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, symptom, or specialty..." className="flex-1 bg-transparent outline-none text-base font-medium placeholder:text-muted-foreground/60" />
            </div>
            
            <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 gap-3 lg:flex lg:gap-3">
              <select value={search.city} onChange={(e) => update({ city: e.target.value })} className="px-4 py-3.5 rounded-2xl bg-background border border-border/50 text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer shadow-sm">
                <option value="">All Cities</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={search.specialty} onChange={(e) => update({ specialty: e.target.value })} className="px-4 py-3.5 rounded-2xl bg-background border border-border/50 text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer shadow-sm">
                <option value="">All Specialties</option>
                {SPECIALTIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="flex items-center justify-center gap-2 text-sm font-bold px-4 py-3.5 rounded-2xl bg-background border border-border/50 cursor-pointer hover:bg-primary/5 transition-colors shadow-sm select-none">
                <input type="checkbox" className="rounded text-primary focus:ring-primary accent-primary size-4" checked={search.govt} onChange={(e) => update({ govt: e.target.checked })} /> Govt
              </label>
              <label className="flex items-center justify-center gap-2 text-sm font-bold px-4 py-3.5 rounded-2xl bg-background border border-border/50 cursor-pointer hover:bg-emergency/5 transition-colors shadow-sm select-none">
                <input type="checkbox" className="rounded text-emergency focus:ring-emergency accent-emergency size-4" checked={search.emergency} onChange={(e) => update({ emergency: e.target.checked })} /> 24×7 ER
              </label>
            </div>
            <Button type="submit" size="lg" className="w-full lg:w-auto rounded-2xl shadow-soft font-bold text-base px-8 py-6 hover-lift hidden sm:flex"><Filter className="size-5 mr-2" />Apply Filters</Button>
          </form>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({length:6}).map((_,i)=>(
              <div key={i} className="h-[380px] rounded-3xl bg-muted/40 animate-pulse border border-border/30" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center glass-card rounded-3xl border border-border/50 flex flex-col items-center justify-center min-h-[400px]">
            <Search className="size-16 text-muted-foreground/30 mb-6" />
            <h3 className="text-2xl font-bold mb-2">No hospitals found</h3>
            <p className="text-muted-foreground text-lg">We couldn't find any facilities matching your current filters.</p>
            <Button onClick={() => update({ q: "", city: "", specialty: "", govt: false, emergency: false })} variant="outline" className="mt-6 rounded-xl">Clear all filters</Button>
          </div>
        ) : (
          <div className="animate-in fade-in duration-1000">
            <div className="mb-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Showing {(page-1)*PAGE_SIZE + 1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length} facilities</span>
              {search.q && <span className="bg-primary/10 text-primary px-3 py-1 rounded-full normal-case tracking-normal">Results for "{search.q}"</span>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {pageItems.map((h: any, index: number) => {
                const beds = Array.isArray(h.beds) ? h.beds[0] : h.beds;
                const checked = compare.includes(h.id);
                return (
                  <article key={h.id} className="relative flex flex-col p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/40 shadow-sm hover:shadow-soft transition-all duration-300 hover-lift group animate-in fade-in zoom-in-95" style={{ animationDelay: `${index * 50}ms` }}>
                    
                    {checked && <div className="absolute inset-0 border-2 border-primary rounded-3xl pointer-events-none" />}

                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {h.is_government && <ShieldCheck className="size-4 text-primary" />}
                          <h3 className="font-display font-extrabold text-xl sm:text-2xl line-clamp-1 group-hover:text-primary transition-colors">{h.name}</h3>
                        </div>
                        <div className="text-sm text-muted-foreground font-medium flex items-start gap-1.5 mt-2">
                          <MapPin className="size-4 shrink-0 mt-0.5 text-primary/70" />
                          <span className="line-clamp-2">{h.address}, {h.city}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warning/15 text-warning-foreground text-sm font-bold border border-warning/20 shadow-sm">
                          <Star className="size-4 fill-current" /> {Number(h.rating).toFixed(1)}
                        </div>
                        <div className="mt-2 text-xs font-bold text-muted-foreground inline-flex items-center bg-muted/50 px-2 py-1 rounded-lg">
                          <IndianRupee className="size-3" /> Cost {h.cost_tier}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-5">
                      {h.emergency_24x7 && <Tag tone="emergency"><AlertTriangle className="size-3 mr-1" /> 24×7 ER</Tag>}
                      {h.has_icu && <Tag tone="primary">ICU Equipped</Tag>}
                      {h.has_ambulance && <Tag tone="success">Ambulance</Tag>}
                      {h.ayushman && <Tag tone="primary">Ayushman Bharat</Tag>}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {(h.specialties || []).slice(0,5).map((s: string) => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-muted text-muted-foreground font-medium border border-border/50">{s}</span>
                      ))}
                      {(h.specialties?.length > 5) && <span className="text-xs px-2.5 py-1 rounded-lg bg-muted text-muted-foreground font-medium border border-border/50">+{h.specialties.length - 5} more</span>}
                    </div>

                    <div className="mt-auto">
                      {beds ? (
                        <div className="mb-5 grid grid-cols-4 gap-2 text-center">
                          <BedStat label="ICU Beds" v={beds.icu_available} total={beds.icu_total} />
                          <BedStat label="Oxygen" v={beds.oxygen_available} total={beds.oxygen_total} />
                          <BedStat label="ER Beds" v={beds.emergency_available} total={beds.emergency_total} />
                          <BedStat label="General" v={beds.general_available} total={beds.general_total} />
                        </div>
                      ) : (
                        <div className="mb-5 p-4 rounded-xl bg-muted/30 border border-border/50 text-center text-sm font-medium text-muted-foreground">
                          Bed availability data not currently synced.
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-5 border-t border-border/50">
                        <label className="flex items-center gap-2.5 text-sm font-bold text-muted-foreground cursor-pointer group/label">
                          <div className={`size-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-primary border-primary' : 'border-muted-foreground/40 group-hover/label:border-primary/50'}`}>
                            {checked && <GitCompare className="size-3 text-primary-foreground" />}
                          </div>
                          <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleCompare(h.id)} /> 
                          Compare
                        </label>
                        <div className="flex gap-2.5">
                          <Link to="/doctors" search={{ hospital: h.id }}>
                            <Button variant="outline" size="sm" className="rounded-xl border-border/50 font-bold hover:bg-primary/5 hover:text-primary"><Stethoscope className="size-4 mr-1.5" />Doctors</Button>
                          </Link>
                          <a href={`https://www.google.com/maps/search/${encodeURIComponent(h.name + " " + h.city)}`} target="_blank" rel="noreferrer">
                            <Button size="sm" className="rounded-xl font-bold shadow-soft bg-foreground hover:bg-foreground/90 text-background"><Navigation className="size-4 mr-1.5" />Route</Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12 mb-6">
                <Button variant="outline" size="lg" className="rounded-xl font-bold" disabled={page === 1} onClick={() => { setPage(p => Math.max(1, p-1)); window.scrollTo({top:0, behavior:'smooth'}); }}>Previous</Button>
                <div className="bg-card border border-border/50 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm">
                  Page {page} of {totalPages}
                </div>
                <Button variant="outline" size="lg" className="rounded-xl font-bold" disabled={page === totalPages} onClick={() => { setPage(p => Math.min(totalPages, p+1)); window.scrollTo({top:0, behavior:'smooth'}); }}>Next Page</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Tag({ children, tone = "default" }: { children: React.ReactNode; tone?: "default"|"success"|"primary"|"emergency" }) {
  const cls = tone === "emergency" ? "bg-emergency/15 text-emergency border-emergency/20" : tone === "success" ? "bg-success/15 text-success border-success/20" : tone === "primary" ? "bg-primary/15 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border/50";
  return <span className={`text-xs px-2.5 py-1 rounded-full font-bold border flex items-center shadow-sm ${cls}`}>{children}</span>;
}

function BedStat({ label, v, total }: { label: string; v: number, total?: number }) {
  const tone = v > 10 ? "text-success" : v > 2 ? "text-warning-foreground" : "text-emergency";
  const bg = v > 10 ? "bg-success/5 border-success/10" : v > 2 ? "bg-warning/5 border-warning/10" : "bg-emergency/5 border-emergency/10";
  return (
    <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center shadow-sm ${bg}`}>
      <div className={`text-xl font-extrabold ${tone} leading-none mb-1`}>{v}</div>
      {total !== undefined && <div className="text-[10px] font-semibold text-muted-foreground mb-0.5">/ {total}</div>}
      <div className="text-[10px] font-bold text-foreground/80 uppercase tracking-wide text-center leading-tight">{label}</div>
    </div>
  );
}
