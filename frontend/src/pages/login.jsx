import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, KeyRound, User, CalendarDays, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

const GENDERS = ["Female", "Male", "Other", "Prefer not to say"];

function passwordProblem(pw) {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "Password must include at least one letter and one number.";
  return null;
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { user, login, signup } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) nav(redirect, { replace: true });
  }, [user, redirect, nav]);

  const submit = async (e) => {
    e.preventDefault();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    if (!emailOk) return toast.error("Please enter a valid email address.");

    if (mode === "signup") {
      if (!name.trim()) return toast.error("Please enter your full name.");
      if (!gender) return toast.error("Please select your gender.");
      if (!dob) return toast.error("Please enter your date of birth.");
      const d = new Date(dob);
      if (Number.isNaN(d.getTime()) || d > new Date()) return toast.error("Please enter a valid date of birth.");
      const pwErr = passwordProblem(password);
      if (pwErr) return toast.error(pwErr);
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        await signup({
          email: email.trim(),
          password,
          full_name: name.trim(),
          gender,
          dob,
        });
        toast.success("Account created! Welcome to MediRoute.");
      } else {
        await login(email.trim(), password);
        toast.success("Welcome back!");
      }
    } catch (err) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const inputBase = "flex-1 bg-transparent outline-none text-sm";

  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-10">
      <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border shadow-soft">
        <h1 className="font-display text-2xl font-bold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage appointments, reviews and health records.</p>

        <form onSubmit={submit} className="space-y-3 mt-6">
          {mode === "signup" && (
            <>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                <User className="size-4 text-muted-foreground" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Full name *"
                  className={inputBase}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="px-3 py-2 rounded-lg bg-muted text-sm outline-none cursor-pointer"
                >
                  <option value="">Gender *</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                  <CalendarDays className="size-4 text-muted-foreground shrink-0" />
                  <input
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    type="date"
                    required
                    max={new Date().toISOString().slice(0, 10)}
                    aria-label="Date of birth"
                    className={inputBase}
                  />
                </div>
              </div>
            </>
          )}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
            <Mail className="size-4 text-muted-foreground" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="Email address *"
              className={inputBase}
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
            <KeyRound className="size-4 text-muted-foreground" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={mode === "signup" ? 8 : 6}
              placeholder="Password *"
              className={inputBase}
            />
          </div>
          {mode === "signup" && (
            <p className="text-xs text-muted-foreground">At least 8 characters, including a letter and a number.</p>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </Button>
        </form>

        <button
          onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
          className="w-full text-sm text-muted-foreground mt-4 hover:text-foreground transition-colors"
        >
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}