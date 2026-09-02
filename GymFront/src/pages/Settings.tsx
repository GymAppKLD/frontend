import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateMember } from "../api/memberApi";

export default function Settings() {
  const { user, logout } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const save = () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    updateMember({ name, email })
      .then(() => setSaved(true))
      .catch(() => setError("Failed to save changes."))
      .finally(() => setSaving(false));
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: 64 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, marginTop: 16, borderBottom: "1px solid var(--border)", paddingBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.04em", textTransform: "uppercase", lineHeight: 1 }}>SETTINGS</h1>
        </div>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>OPERATOR PROFILE</div>

        <div className="field">
          <label>CALLSIGN (NAME)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="score-input"
            style={{ background: "var(--faint)", textAlign: "left", padding: "12px 16px", textTransform: "uppercase" }}
          />
        </div>
        
        <div className="field" style={{ marginBottom: 32 }}>
          <label>IDENTIFIER (EMAIL)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="score-input"
            style={{ background: "var(--faint)", textAlign: "left", padding: "12px 16px" }}
          />
        </div>

        {error && <p style={{ color: "var(--danger)", marginBottom: 24, fontSize: 13, fontFamily: "var(--mono)", background: "var(--danger-glow)", padding: 12, borderRadius: 4 }}>[ ERR: {error} ]</p>}
        
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <button className="btn btn-primary" onClick={save} disabled={saving} style={{ padding: "12px 24px" }}>
            {saving ? "SAVING..." : "SAVE"}
          </button>
          {saved && <span style={{ color: "var(--success)", fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: "0.1em" }}>[ SUCCESS ]</span>}
        </div>
      </div>

      <div className="card" style={{ marginTop: 32, borderColor: "var(--danger)", padding: 32 }}>
        <div style={{ fontSize: 12, color: "var(--danger)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 24, borderBottom: "1px solid var(--danger)", paddingBottom: 12, opacity: 0.8 }}>DANGER ZONE</div>
        <button 
          className="btn" 
          style={{ background: "var(--danger-glow)", color: "var(--danger)", border: "1px solid var(--danger)", padding: "12px 24px", width: "100%" }}
          onClick={() => logout()}
        >
          TERMINATE SESSION
        </button>
      </div>
    </div>
  );
}
