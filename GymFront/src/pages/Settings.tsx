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
    updateMember({ name, email })
      .then(() => {
        setSaved(true);
        // In a real app we might want to update the auth context user here, 
        // but for now we just show success.
      })
      .catch(() => setError("Não foi possível salvar."))
      .finally(() => setSaving(false));
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Manage your account</p>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Profile</div>
        </div>

        <div className="field">
          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && <p style={{ color: "var(--pink)", marginBottom: 16 }}>{error}</p>}
        
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && <span style={{ color: "var(--teal)", fontSize: 13, fontWeight: 600 }}>Saved!</span>}
        </div>
      </div>

      <div className="card" style={{ marginTop: 24, borderColor: "var(--pink)" }}>
        <div className="card-head">
          <div className="card-title" style={{ color: "var(--pink)" }}>Danger Zone</div>
        </div>
        <button 
          className="btn" 
          style={{ background: "#FDEAF1", color: "var(--pink)", border: "1px solid var(--pink)" }}
          onClick={() => logout()}
        >
          Log out
        </button>
      </div>
    </>
  );
}
