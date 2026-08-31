import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const ids = searchParams.get("ids") || "";
  const idArr = ids.split(",").filter(Boolean);

  const { data = [], isLoading } = useQuery({
    queryKey: ["compare", ids],
    queryFn: async () => {
      if (!idArr.length) return [];
      const res = await fetch(`http://localhost:3001/api/hospitals?ids=${encodeURIComponent(ids)}`);
      if (!res.ok) throw new Error("Failed to fetch compare data");
      return res.json();
    },
  });

  const yn = (v) => (v ? <Check className="size-4 text-success mx-auto" /> : <X className="size-4 text-muted-foreground mx-auto" />);
  const rows = [
    { k: "City", get: (h) => h.city },
    { k: "Rating", get: (h) => Number(h.rating).toFixed(1) },
    { k: "Cost tier", get: (h) => h.cost_tier },
    { k: "24×7 ER", get: (h) => yn(h.emergency_24x7) },
    { k: "ICU", get: (h) => yn(h.has_icu) },
    { k: "MRI", get: (h) => yn(h.has_mri) },
    { k: "Ambulance", get: (h) => yn(h.has_ambulance) },
    { k: "Government", get: (h) => yn(h.is_government) },
    { k: "Ayushman", get: (h) => yn(h.ayushman) },
    { k: "ICU beds available", get: (h) => (Array.isArray(h.beds) ? h.beds[0]?.icu_available : h.beds?.icu_available) ?? 0 },
    { k: "Oxygen beds", get: (h) => (Array.isArray(h.beds) ? h.beds[0]?.oxygen_available : h.beds?.oxygen_available) ?? 0 },
    { k: "Specialties", get: (h) => (h.specialties || []).join(", ") },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Link to="/hospitals">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="size-4 mr-1" />
          Back
        </Button>
      </Link>
      <h1 className="font-display text-3xl font-bold mt-3 mb-6">Hospital Comparison</h1>
      {isLoading ? (
        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
      ) : data.length === 0 ? (
        <div className="p-10 text-center bg-card border border-border rounded-2xl text-muted-foreground">
          Pick hospitals from the hospital list to compare.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-semibold">Feature</th>
                {data.map((h) => (
                  <th key={h.id || h._id} className="p-3 font-semibold text-center">
                    {h.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.k} className="border-t border-border">
                  <td className="p-3 font-medium text-muted-foreground">{r.k}</td>
                  {data.map((h) => (
                    <td key={h.id || h._id} className="p-3 text-center">
                      {r.get(h)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}