import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { CalendarPlus, Trash2, CheckCircle2, Stethoscope, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AppointmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const doctor = searchParams.get("doctor") || "";
  const { user, loading, token } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) {
      nav("/login?redirect=/appointments");
    }
  }, [loading, user, nav]);

  const [date, setDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [time, setTime] = useState("10:30");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: doc } = useQuery({
    enabled: !!doctor,
    queryKey: ["doc", doctor],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3001/api/doctors/${doctor}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: appts = [] } = useQuery({
    enabled: !!user,
    queryKey: ["appts", user?.id || user?._id],
    queryFn: async () => {
      const authToken = token || localStorage.getItem("mr-token");
      const res = await fetch("http://localhost:3001/api/appointments", {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const book = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to book an appointment");
      return nav("/login?redirect=/appointments");
    }
    if (!doc) {
      toast.error("Please select a doctor first");
      return;
    }

    setSubmitting(true);
    try {
      const authToken = token || localStorage.getItem("mr-token");
      const res = await fetch("http://localhost:3001/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          doctor_id: doc.id || doc._id,
          hospital_id: doc.hospital_id || doc.hospital?._id || doc.hospital?.id,
          appointment_date: date,
          appointment_time: time,
          patient_name: name || user.full_name || user.email?.split("@")[0] || "Patient",
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      toast.success("Appointment booked! You'll receive a confirmation.");
      setNotes("");
      setName("");
      qc.invalidateQueries({ queryKey: ["appts", user?.id || user?._id] });
      setSearchParams({});
    } catch (err) {
      toast.error(err.message || "Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async (id) => {
    try {
      const authToken = token || localStorage.getItem("mr-token");
      const res = await fetch(`http://localhost:3001/api/appointments/${id}`, {
        method: "DELETE",
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      if (!res.ok) throw new Error("Failed to cancel");
      toast.success("Appointment cancelled");
      qc.invalidateQueries({ queryKey: ["appts", user?.id || user?._id] });
    } catch (err) {
      toast.error(err.message || "Failed to cancel appointment");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-8">
      <section>
        <h1 className="font-display text-3xl font-bold">Book Appointment</h1>
        {doc ? (
          <div className="mt-4 p-4 rounded-2xl bg-card border border-border">
            <div className="font-semibold text-lg">{doc.name}</div>
            <div className="text-sm text-muted-foreground">{doc.specialization} · {doc.hospitals?.name || doc.hospital?.name}, {doc.hospitals?.city || doc.hospital?.city}</div>
            <div className="text-xs text-muted-foreground mt-1">{doc.timing} · ₹{doc.consultation_fee}</div>
          </div>
        ) : (
          <p className="mt-2 text-muted-foreground">
            Pick a doctor from the <Link to="/doctors" className="text-primary underline">doctors page</Link>.
          </p>
        )}

        {doc && (
          <form onSubmit={book} className="mt-5 grid gap-3 p-5 rounded-2xl bg-card border border-border">
            <label className="text-sm">
              Patient name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="mt-1 w-full px-3 py-2 rounded-lg bg-muted text-sm outline-none"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                Date
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-muted text-sm outline-none"
                />
              </label>
              <label className="text-sm">
                Time
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-muted text-sm outline-none"
                />
              </label>
            </div>
            <label className="text-sm">
              Notes (optional)
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-muted text-sm outline-none"
              />
            </label>
            <Button type="submit" disabled={submitting}>
              <CalendarPlus className="size-4 mr-2" />
              {submitting ? "Booking…" : "Confirm Booking"}
            </Button>
          </form>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold">Your Appointments</h2>
        {appts.length === 0 ? (
          <p className="mt-3 text-muted-foreground text-sm">No appointments yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {appts.map((a) => (
              <li key={a.id || a._id} className="p-4 rounded-2xl bg-card border border-border flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-success" />
                    {a.doctors?.name || a.doctor?.name || "Doctor"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {a.doctors?.specialization || a.doctor?.specialization} · {a.hospitals?.name || a.hospital?.name}
                  </div>
                  <div className="text-sm mt-1">
                    {a.appointment_date} at {a.appointment_time}
                  </div>
                  {a.notes && <div className="text-xs text-muted-foreground mt-1">"{a.notes}"</div>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => cancel(a.id || a._id)} aria-label="Cancel">
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}