import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { FileHeart, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RecordsPage() {
  const { user, loading, token } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) {
      nav("/login?redirect=/records");
    }
  }, [loading, user, nav]);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("prescription");
  const [notes, setNotes] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data = [] } = useQuery({
    enabled: !!user,
    queryKey: ["records", user?.id || user?._id],
    queryFn: async () => {
      const authToken = token || localStorage.getItem("mr-token");
      const res = await fetch("http://localhost:3001/api/health-records", {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const add = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const authToken = token || localStorage.getItem("mr-token");
      const res = await fetch("http://localhost:3001/api/health-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          title,
          record_type: type,
          notes,
          file_url: url,
        }),
      });
      if (!res.ok) throw new Error("Failed to save record");
      toast.success("Record saved");
      setTitle("");
      setNotes("");
      setUrl("");
      qc.invalidateQueries({ queryKey: ["records", user?.id || user?._id] });
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    try {
      const authToken = token || localStorage.getItem("mr-token");
      const res = await fetch(`http://localhost:3001/api/health-records/${id}`, {
        method: "DELETE",
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Record removed");
      qc.invalidateQueries({ queryKey: ["records", user?.id || user?._id] });
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-12 rounded-2xl bg-accent/20 text-accent-foreground grid place-items-center">
          <FileHeart className="size-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">My Health Records</h1>
          <p className="text-muted-foreground">Store prescriptions and reports — only you can see them.</p>
        </div>
      </div>

      <form onSubmit={add} className="grid gap-3 p-5 rounded-2xl bg-card border border-border mb-6">
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. Blood Test - Mar 2025)"
            className="px-3 py-2 rounded-lg bg-muted text-sm outline-none sm:col-span-2"
          />
          <select value={type} onChange={(e) => setType(e.target.value)} className="px-3 py-2 rounded-lg bg-muted text-sm">
            <option value="prescription">Prescription</option>
            <option value="report">Report</option>
            <option value="test">Test result</option>
            <option value="vaccine">Vaccination</option>
          </select>
        </div>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="File URL (optional)"
          className="px-3 py-2 rounded-lg bg-muted text-sm outline-none"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Notes"
          className="px-3 py-2 rounded-lg bg-muted text-sm outline-none"
        />
        <Button type="submit" disabled={submitting}>
          <Plus className="size-4 mr-2" />
          {submitting ? "Saving…" : "Add record"}
        </Button>
      </form>

      <ul className="space-y-3">
        {data.map((r) => (
          <li key={r.id || r._id} className="p-4 rounded-2xl bg-card border border-border flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">{r.title}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {r.record_type} · {new Date(r.created_at || r.createdAt || Date.now()).toLocaleDateString()}
              </div>
              {r.notes && <p className="text-sm mt-2">{r.notes}</p>}
              {r.file_url && (
                <a href={r.file_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
                  View file
                </a>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => remove(r.id || r._id)}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </li>
        ))}
        {data.length === 0 && (
          <li className="p-8 text-center text-muted-foreground bg-card border border-border rounded-2xl">No records yet.</li>
        )}
      </ul>
    </div>
  );
}