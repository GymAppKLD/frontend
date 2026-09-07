import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authenticate } = useAuth();

  useEffect(() => {
    document.body.setAttribute('data-theme', 'scoreboard');
    return () => document.body.removeAttribute('data-theme');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ email, password });
      authenticate(response);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ width: 48, height: 48, background: "var(--accent)", borderRadius: 4, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--bg)", fontWeight: 800, fontSize: 24, fontFamily: "var(--mono)" }}>K</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--ink)" }}>KFIT SYSTEM</h1>
        <p style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginTop: 8 }}>AUTHENTICATION REQUIRED</p>
      </div>

      <div className="card" style={{ padding: 32 }}>
        {error && <div style={{ color: "var(--danger)", marginBottom: 24, fontSize: 13, fontFamily: "var(--mono)", textAlign: "center", background: "var(--danger-glow)", padding: 12, borderRadius: 4, border: "1px solid var(--danger)" }}>[ ERR: {error} ]</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>OPERATOR IDENTIFIER (EMAIL)</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@domain.com"
              style={{ fontFamily: "var(--mono)" }}
            />
          </div>
          
          <div className="field">
            <label>SECURITY CLEARANCE (PASSWORD)</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ fontFamily: "var(--mono)", letterSpacing: "0.2em" }}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", marginTop: 16, padding: 16, fontSize: 14 }}
            disabled={loading}
          >
            {loading ? "AUTHENTICATING..." : "INITIATE HANDSHAKE"}
          </button>
        </form>
        
        <div style={{ marginTop: 32, textAlign: "center", fontSize: 12, fontFamily: "var(--mono)", color: "var(--muted)", letterSpacing: "0.05em" }}>
          NO CLEARANCE? <Link to="/register" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "underline" }}>REQUEST ACCESS</Link>
        </div>
      </div>
    </div>
  );
}
