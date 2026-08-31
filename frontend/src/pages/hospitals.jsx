import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Search, MapPin, Star, Bed, Stethoscope, IndianRupee, GitCompare, Filter, Plus, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

// Symptom → specialty hints. Fuzzy-matched so typos still route correctly ("chst pian" → cardiology).
const SYMPTOM_HINTS = {
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

const SPECIALTIES = ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Dermatology", "Oncology", "General Medicine", "Dental"];
const CITIES = ["Mumbai", "New Delhi", "Bengaluru", "Vellore", "Anand"];

export default function HospitalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQ = searchParams.get("q") || "";
  const searchCity = searchParams.get("city") || "";
  const searchSpecialty = searchParams.get("specialty") || "";
  const searchGovt = searchParams.get("govt") === "true";
  const searchEmergency = searchParams.get("emergency") === "true";

  const [q, setQ] = useState(searchQ);
  useEffect(() => setQ(searchQ), [searchQ]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const [compare, setCompare] = useState([]);
  const toggleCompare = (id) =>
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c));

  const { data: hospitals = [], isLoading } = useQuery({
    queryKey: ["hospitals"],
    queryFn: async () => {
      const resp = await fetch("http://localhost:3001/api/hospitals");
      if (!resp.ok) throw new Error("Failed to fetch hospitals");
      return resp.json();
    },
  });

  // Pre-filtered (city/specialty/flags) before fuzzy search
  const prefiltered = useMemo(() => {
    return hospitals.filter((h) => {
      if (searchCity && h.city !== searchCity) return false;
      if (searchSpecialty && !(h.specialties || []).some((s) => s.toLowerCase().includes(searchSpecialty.toLowerCase()))) return false;
      if (searchGovt && !h.is_government) return false;
      if (searchEmergency && !h.emergency_24x7) return false;
      return true;
    });
  }, [hospitals, searchCity, searchSpecialty, searchGovt, searchEmergency]);

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
    [prefiltered]
  );

  const filtered = useMemo(() => {
    const raw = searchQ.trim();
    if (!raw) return prefiltered;

    // Symptom routing — fuzzy-match the query against known symptom phrases
    const hintFuse = new Fuse(Object.keys(SYMPTOM_HINTS), { threshold: 0.4, ignoreLocation: true });
    const hintMatches = hintFuse.search(raw.toLowerCase()).slice(0, 2);
    const hintedSpecs = hintMatches.flatMap((m) => SYMPTOM_HINTS[m.item]);

    const direct = fuse.search(raw).map((r) => r.item);
    if (hintedSpecs.length === 0) return direct;

    const specMatches = prefiltered.filter((h) =>
      (h.specialties || []).some((s) => hintedSpecs.some((hs) => s.toLowerCase().includes(hs.toLowerCase())))
    );
    // Merge, dedupe, keep direct matches first
    const seen = new Set();
    return [...direct, ...specMatches].filter((h) => (seen.has(h.id || h._id) ? false : (seen.add(h.id || h._id), true)));
  }, [fuse, prefiltered, searchQ]);

  // Reset to page 1 whenever filters/query change
  useEffect(() => {
    setPage(1);
  }, [searchQ, searchCity, searchSpecialty, searchGovt, searchEmergency]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const update = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === "" || v === false || v === null || v === undefined) {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    setSearchParams(next);
  };

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
              <Button variant="outline" className="rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 shadow-sm transition-all hover-lift">
                <Plus className="size-4.5 mr-2" />Add facility
              </Button>
            </Link>
            {compare.length >= 2 && (
              <Link to={`/compare?ids=${compare.join(",")}`}>
                <Button className="rounded-xl shadow-soft font-bold hover-lift animate-pulse-ring">
                  <GitCompare className="size-4.5 mr-2" />Compare ({compare.length})
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-3 sm:p-5 shadow-soft mb-10 sticky top-24 z-30 animate-in fade-in slide-in-from-top-8 duration-700 delay-100 border border-border/50 backdrop-blur-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              update({ q });
            }}
            className="flex flex-wrap lg:flex-nowrap gap-3 items-center"
          >
            <div className="flex-1 w-full lg:min-w-[320px] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-background border border-border/50 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm">
              <Search className="size-5 text-primary" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, symptom, or specialty..."
                className="flex-1 bg-transparent outline-none text-base font-medium placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 gap-3 lg:flex lg:gap-3">
              <select
                value={searchCity}
                onChange={(e) => update({ city: e.target.value })}
                className="px-4 py-3.5 rounded-2xl bg-background border border-border/50 text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer shadow-sm"
              >
                <option value="">All Cities</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={searchSpecialty}
                onChange={(e) => update({ specialty: e.target.value })}
                className="px-4 py-3.5 rounded-2xl bg-background border border-border/50 text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer shadow-sm"
              >
                <option value="">All Specialties</option>
                {SPECIALTIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <label className="flex items-center justify-center gap-2 text-sm font-bold px-4 py-3.5 rounded-2xl bg-background border border-border/50 cursor-pointer hover:bg-primary/5 transition-colors shadow-sm select-none">
                <input
                  type="checkbox"
                  className="rounded text-primary focus:ring-primary accent-primary size-4"
                  checked={searchGovt}
                  onChange={(e) => update({ govt: e.target.checked })}
                />{" "}
                Govt
              </label>
              <label className="flex items-center justify-center gap-2 text-sm font-bold px-4 py-3.5 rounded-2xl bg-background border border-border/50 cursor-pointer hover:bg-emergency/5 transition-colors shadow-sm select-none">
                <input
                  type="checkbox"
                  className="rounded text-emergency focus:ring-emergency accent-emergency size-4"
                  checked={searchEmergency}
                  onChange={(e) => update({ emergency: e.target.checked })}
                />{" "}
                24×7 ER
              </label>
            </div>

            <Button type="submit" size="lg" className="w-full lg:w-auto rounded-2xl px-8 font-bold shadow-soft hover-lift h-13">
              <Filter className="size-4.5 mr-2" />
              Apply
            </Button>
          </form>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-96 rounded-3xl bg-muted/60 animate-pulse border border-border/40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center glass-card rounded-3xl border border-border/50 max-w-xl mx-auto shadow-soft">
            <div className="size-16 rounded-2xl bg-muted grid place-items-center mx-auto mb-4 text-muted-foreground">
              <Search className="size-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">No facilities match your search</h3>
            <p className="text-muted-foreground text-sm mb-6">Try clearing some filters or searching for broader symptoms.</p>
            <Button variant="outline" onClick={() => update({ q: "", city: "", specialty: "", govt: false, emergency: false })}>
              Reset all filters
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-6 text-sm font-semibold text-muted-foreground flex items-center justify-between">
              <span>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} facilities
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((h) => {
                const beds = Array.isArray(h.beds) ? h.beds[0] : h.beds;
                const hId = h.id || h._id;
                const checked = compare.includes(hId);
                return (
                  <article
                    key={hId}
                    className="group relative rounded-3xl bg-card border border-border/60 hover:border-primary/50 shadow-sm hover:shadow-soft transition-all duration-300 flex flex-col justify-between overflow-hidden hover-lift"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-display font-bold text-xl group-hover:text-primary transition-colors leading-tight">{h.name}</h3>
                          <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mt-1.5">
                            <MapPin className="size-4 text-primary shrink-0" />
                            <span>{h.city} · {h.address}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warning/15 text-warning-foreground text-sm font-extrabold shadow-sm">
                            <Star className="size-4 fill-current text-amber-500" />
                            {Number(h.rating).toFixed(1)}
                          </div>
                          <span className="text-[11px] font-bold text-muted-foreground mt-1 tracking-wider uppercase inline-flex items-center">
                            <IndianRupee className="size-3" />{h.cost_tier}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {h.emergency_24x7 && <Tag tone="emergency">24×7 ER</Tag>}
                        {h.has_icu && <Tag>ICU</Tag>}
                        {h.has_mri && <Tag>MRI</Tag>}
                        {h.has_ambulance && <Tag>Ambulance</Tag>}
                        {h.is_government && <Tag tone="primary">Govt</Tag>}
                        {h.ayushman && <Tag tone="success">Ayushman</Tag>}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {(h.specialties || []).slice(0, 4).map((s) => (
                          <span key={s} className="text-xs px-2.5 py-1 rounded-xl bg-muted font-medium text-muted-foreground">
                            {s}
                          </span>
                        ))}
                      </div>

                      {beds && (
                        <div className="mt-5 grid grid-cols-4 gap-2 bg-muted/40 p-3 rounded-2xl border border-border/40">
                          <BedStat label="ICU" v={beds.icu_available ?? 0} />
                          <BedStat label="Oxygen" v={beds.oxygen_available ?? 0} />
                          <BedStat label="Emergency" v={beds.emergency_available ?? 0} />
                          <BedStat label="General" v={beds.general_available ?? 0} />
                        </div>
                      )}
                    </div>

                    <div className="p-6 pt-0">
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded text-primary focus:ring-primary accent-primary size-4"
                            checked={checked}
                            onChange={() => toggleCompare(hId)}
                          />
                          Compare
                        </label>
                        <div className="flex gap-2">
                          <Link to={`/doctors?hospital=${hId}`}>
                            <Button variant="outline" size="sm" className="rounded-xl font-bold">
                              <Stethoscope className="size-4 mr-1" />
                              Doctors
                            </Button>
                          </Link>
                          <a
                            href={`https://www.google.com/maps/search/${encodeURIComponent(h.name + " " + h.city)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button size="sm" className="rounded-xl font-bold">
                              <Navigation className="size-4 mr-1" />
                              Directions
                            </Button>
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
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl font-bold"
                  disabled={page === 1}
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Previous
                </Button>
                <div className="bg-card border border-border/50 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl font-bold"
                  disabled={page === totalPages}
                  onClick={() => {
                    setPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Next Page
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Tag({ children, tone = "default" }) {
  const cls =
    tone === "emergency"
      ? "bg-emergency/15 text-emergency border-emergency/20"
      : tone === "success"
      ? "bg-success/15 text-success border-success/20"
      : tone === "primary"
      ? "bg-primary/15 text-primary border-primary/20"
      : "bg-muted text-muted-foreground border-border/50";
  return <span className={`text-xs px-2.5 py-1 rounded-full font-bold border flex items-center shadow-sm ${cls}`}>{children}</span>;
}

function BedStat({ label, v }) {
  const tone = v > 10 ? "text-success" : v > 2 ? "text-warning-foreground" : "text-emergency";
  return (
    <div className="p-2 rounded-xl bg-background border border-border/40 flex flex-col items-center justify-center shadow-sm">
      <div className={`text-base font-extrabold ${tone} leading-none mb-1`}>{v}</div>
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}