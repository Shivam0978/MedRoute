import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pill, Phone, MapPin, Truck, Clock } from "lucide-react";

export default function PharmacyPage() {
  const [q, setQ] = useState("");
  const [only24, setOnly24] = useState(false);
  const [delivery, setDelivery] = useState(false);

  const { data = [], isLoading } = useQuery({
    queryKey: ["pharmacies"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/api/pharmacies");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const filtered = data.filter((p) => {
    const text = q.toLowerCase();
    const match =
      !text ||
      p.name.toLowerCase().includes(text) ||
      p.city.toLowerCase().includes(text) ||
      (p.medicines || []).some((m) => m.toLowerCase().includes(text));
    return match && (!only24 || p.open_24x7) && (!delivery || p.home_delivery);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-12 rounded-2xl bg-accent/20 text-accent-foreground grid place-items-center">
          <Pill className="size-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Pharmacies & Medicines</h1>
          <p className="text-muted-foreground">24×7 pharmacies, home delivery and medicine availability.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 mb-6 flex flex-wrap gap-2 shadow-soft">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by city or medicine"
          className="px-3 py-2 rounded-lg bg-muted text-sm flex-1 min-w-[200px] outline-none"
        />
        <label className="text-sm flex items-center gap-2 px-3 py-2 rounded-lg bg-muted cursor-pointer">
          <input type="checkbox" checked={only24} onChange={(e) => setOnly24(e.target.checked)} /> 24×7
        </label>
        <label className="text-sm flex items-center gap-2 px-3 py-2 rounded-lg bg-muted cursor-pointer">
          <input type="checkbox" checked={delivery} onChange={(e) => setDelivery(e.target.checked)} /> Home delivery
        </label>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id || p._id} className="p-5 rounded-2xl bg-card border border-border hover:shadow-soft transition">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <div className="text-sm text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3.5" />
                    {p.city}
                  </div>
                </div>
                <a href={`tel:${(p.phone || "").replace(/[^0-9+]/g, "")}`} className="text-primary">
                  <Phone className="size-5" />
                </a>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {p.open_24x7 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success-foreground inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    24×7
                  </span>
                )}
                {p.home_delivery && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary inline-flex items-center gap-1">
                    <Truck className="size-3" />
                    Delivery
                  </span>
                )}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">In stock: </span>
                {(p.medicines || []).join(", ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}