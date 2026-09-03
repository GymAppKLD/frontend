import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usePreferences } from "../context/PreferencesContext";
import { updateMember } from "../api/memberApi";

export default function Settings() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = usePreferences();
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
          <h1 style={{ fontSize: 40, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.04em", textTransform: "uppercase", lineHeight: 1 }}>{t("settings").toUpperCase()}</h1>
        </div>
      </div>

      {/* Profile */}
      <div className="card" style={{ padding: 32, marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>{t("profile").toUpperCase()}</div>

        <div className="field">
          <label>{t("name")}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="score-input"
            style={{ background: "var(--faint)", textAlign: "left", padding: "12px 16px" }}
          />
        </div>

        <div className="field" style={{ marginBottom: 32 }}>
          <label>{t("email")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="score-input"
            style={{ background: "var(--faint)", textAlign: "left", padding: "12px 16px" }}
          />
        </div>

        {error && <p style={{ color: "var(--danger)", marginBottom: 24, fontSize: 13, fontFamily: "var(--mono)", background: "var(--danger-glow)", padding: 12, borderRadius: 4 }}>[ {error} ]</p>}

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <button className="btn btn-primary" onClick={save} disabled={saving} style={{ padding: "12px 24px" }}>
            {saving ? t("saving") : t("save")}
          </button>
          {saved && <span style={{ color: "var(--success)", fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: "0.1em" }}>[ SUCCESS ]</span>}
        </div>
      </div>

      {/* Language */}
      <div className="card" style={{ padding: 32, marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>{t("language").toUpperCase()}</div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setLang("en")}
            style={{ flex: 1, padding: "14px 16px", borderRadius: 4, cursor: "pointer", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 13, background: lang === "en" ? "var(--accent)" : "transparent", color: lang === "en" ? "var(--bg)" : "var(--muted)", border: lang === "en" ? "1px solid var(--accent)" : "1px solid var(--border)" }}
          >
            English
          </button>
          <button
            onClick={() => setLang("pt")}
            style={{ flex: 1, padding: "14px 16px", borderRadius: 4, cursor: "pointer", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 13, background: lang === "pt" ? "var(--accent)" : "transparent", color: lang === "pt" ? "var(--bg)" : "var(--muted)", border: lang === "pt" ? "1px solid var(--accent)" : "1px solid var(--border)" }}
          >
            Português (BR)
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="card" style={{ padding: 32 }}>
        <button
          className="btn"
          style={{ background: "var(--danger-glow)", color: "var(--danger)", border: "1px solid var(--danger)", padding: "14px 24px", width: "100%" }}
          onClick={() => logout()}
        >
          {t("logout")}
        </button>
      </div>
    </div>
  );
}
