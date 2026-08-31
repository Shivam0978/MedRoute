import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("mr-token") : null));
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("mr-user");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("mr-token");
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:3001/api/auth/me", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem("mr-user", JSON.stringify(data.user));
          setToken(storedToken);
        } else {
          localStorage.removeItem("mr-token");
          localStorage.removeItem("mr-user");
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn("Auth check failed or backend offline, using cached session if available:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("mr-token", data.token);
    localStorage.setItem("mr-user", JSON.stringify(data.user));
    return data;
  };

  const signup = async (payload) => {
    const res = await fetch("http://localhost:3001/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Sign up failed");
    }

    if (data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("mr-token", data.token);
      localStorage.setItem("mr-user", JSON.stringify(data.user));
    }
    return data;
  };

  const signOut = () => {
    localStorage.removeItem("mr-token");
    localStorage.removeItem("mr-user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}