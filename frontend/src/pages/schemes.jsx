import { useQuery } from "@tanstack/react-query";
import { Landmark, ExternalLink } from "lucide-react";

export default function SchemesPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["schemes"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/api/schemes");
      if (!res.ok) return [];
      return res.json();
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-12 rounded-2xl bg-primary/15 text-primary grid place-items-center">
          <Landmark className="size-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Government Health Schemes</h1>
          <p className="text-muted-foreground">Free and subsidised treatment programs across India.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-2xl text-muted-foreground">
          No schemes listed currently.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.map((s) => (
            <a
              key={s.id || s._id}
              href={s.link}
              target="_blank"
              rel="noreferrer"
              className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-soft transition group"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{s.name}</h3>
                <ExternalLink className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
              <div className="mt-3 grid gap-1 text-xs">
                <div>
                  <span className="font-semibold">Eligibility: </span>
                  <span className="text-muted-foreground">{s.eligibility}</span>
                </div>
                <div>
                  <span className="font-semibold">Benefits: </span>
                  <span className="text-muted-foreground">{s.benefits}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}