import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Star, Clock, IndianRupee, CalendarPlus, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

const SPECS = ["Cardiologist", "Neurologist", "Orthopedic", "Dermatologist", "General Physician", "Pediatrician", "Dentist", "Eye Specialist", "Oncologist", "Gynecologist"];

export default function DoctorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const specialty = searchParams.get("specialty") || "";
  const hospital = searchParams.get("hospital") || "";

  const { data = [], isLoading } = useQuery({
    queryKey: ["doctors", specialty, hospital],
    queryFn: async () => {
      let url = "http://localhost:3001/api/doctors";
      const params = new URLSearchParams();
      if (specialty) params.set("specialization", specialty);
      if (hospital) params.set("hospital", hospital);
      if (params.toString()) url += `?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch doctors");
      return res.json();
    },
  });

  const setSpecialtyFilter = (s) => {
    const next = new URLSearchParams(searchParams);
    if (!s) next.delete("specialty");
    else next.set("specialty", s);
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Doctors</h1>
      <p className="text-muted-foreground">Filter by specialization. View timings, fees, ratings, and waiting time.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => setSpecialtyFilter("")}
          className={`px-3 py-1.5 rounded-full text-xs border transition ${!specialty ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
        >
          All
        </button>
        {SPECS.map((s) => (
          <button
            key={s}
            onClick={() => setSpecialtyFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs border transition ${specialty === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-56 rounded-2xl bg-muted animate-pulse" />)
        ) : data.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-card border border-border rounded-2xl text-muted-foreground">
            No doctors found matching the selected specialization.
          </div>
        ) : (
          data.map((d) => (
            <div key={d.id || d._id} className="p-5 rounded-2xl bg-card border border-border hover:shadow-soft transition">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full gradient-primary text-primary-foreground grid place-items-center font-bold">
                  {d.name.split(" ").slice(-1)[0][0]}
                </div>
                <div>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-sm text-muted-foreground inline-flex items-center gap-1">
                    <Stethoscope className="size-3.5" />
                    {d.specialization}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">{d.hospitals?.name || d.hospital?.name} · {d.hospitals?.city || d.hospital?.city}</div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1 text-warning-foreground">
                  <Star className="size-3.5 fill-current text-warning-foreground" />
                  {Number(d.rating).toFixed(1)}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <IndianRupee className="size-3.5" />
                  {d.consultation_fee}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3.5" />~{d.avg_wait_min}m wait
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{d.timing} · {d.experience_years} yrs exp</div>
              <Link to={`/appointments?doctor=${d.id || d._id}`} className="mt-4 block">
                <Button className="w-full">
                  <CalendarPlus className="size-4 mr-2" />
                  Book Appointment
                </Button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}