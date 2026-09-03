import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePreferences } from "../context/PreferencesContext";
import { fetchGoalsByMember } from "../api/goalApi";
import { goalProgressFactory } from "../utils/goalProgress";
import type { Goal } from "../types/goal";

const LED_CYCLE = ["blue", "yellow", "green"] as const;

export default function Topbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme, t } = usePreferences();
  const [showNotifications, setShowNotifications] = useState(false);
  const [reachedGoals, setReachedGoals] = useState<Goal[]>([]);
  const [ledIndex, setLedIndex] = useState(0);

  // Animate LEDs: blue -> yellow -> green (green holds 3s) -> repeat
  useEffect(() => {
    const isGreen = LED_CYCLE[ledIndex] === "green";
    const timer = setTimeout(() => {
      setLedIndex((i) => (i + 1) % LED_CYCLE.length);
    }, isGreen ? 10000 : 1000);
    return () => clearTimeout(timer);
  }, [ledIndex]);

  useEffect(() => {
    let active = true;
    fetchGoalsByMember()
      .then((goals) => {
        if (!active) return;
        const reached = goals.filter((g) => goalProgressFactory().calculate(g) >= 100);
        setReachedGoals(reached);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const ledColor = (name: string) => {
    switch (name) {
      case "blue": return "var(--info)";
      case "yellow": return "var(--accent)";
      default: return "var(--success)";
    }
  };

  return (
    <header className="topbar" style={{ background: "var(--frame)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em" }}>
          KFIT // {user?.name || "USER"}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {/* Animated status LEDs */}
        <div style={{ display: "flex", gap: 10, paddingRight: 16, borderRight: "1px solid var(--border)", alignItems: "center" }}>
          {LED_CYCLE.map((name) => {
            const active = LED_CYCLE[ledIndex] === name;
            const c = ledColor(name);
            return (
              <div
                key={name}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: active ? c : "var(--faint)",
                  boxShadow: active ? `0 0 10px ${c}` : "none",
                  transition: "background 0.4s ease, box-shadow 0.4s ease",
                }}
              />
            );
          })}
        </div>

        {/* Dark / Light toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={theme === "dark" ? t("lightMode") : t("darkMode")}
          style={{ width: 34, height: 34, background: "var(--bg)", color: theme === "dark" ? "var(--accent)" : "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "1px solid var(--border)", borderRadius: 2 }}
        >
          {theme === "dark" ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" /></svg>
          )}
        </button>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifications((v) => !v)}
            aria-label="Notifications"
            style={{ width: 34, height: 34, background: "var(--bg)", color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "1px solid var(--border)", borderRadius: 2, position: "relative" }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
            {reachedGoals.length > 0 && (
              <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: 8, background: "var(--danger)", color: "var(--bg)", fontSize: 9, fontWeight: 800, fontFamily: "var(--mono)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {reachedGoals.length}
              </div>
            )}
          </button>

          {showNotifications && (
            <div style={{ position: "absolute", right: 0, top: 44, width: 300, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, boxShadow: "0 16px 40px rgba(0,0,0,0.4)", zIndex: 999, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 11, fontFamily: "var(--mono)", letterSpacing: "0.1em", color: "var(--muted)" }}>
                {t("goalReached").toUpperCase()}
              </div>
              {reachedGoals.length === 0 ? (
                <div style={{ padding: 16, fontSize: 13, color: "var(--muted)", fontFamily: "var(--mono)" }}>
                  [ {t("noNotifications").toUpperCase()} ]
                </div>
              ) : (
                reachedGoals.map((g) => (
                  <div key={g.id} onClick={() => { setShowNotifications(false); navigate(`/goals/${g.id}`); }} style={{ padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{g.exerciseName}</span>
                    <span className="score-cell success" style={{ fontSize: 10 }}>100% ✓</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User icon -> opens settings */}
        <button
          onClick={() => navigate("/settings")}
          title={t("settings")}
          style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer" }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 2, background: "var(--faint)", color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, border: "1px solid var(--border)", fontFamily: "var(--mono)" }}>
            {(user?.name || "U").slice(0, 1).toUpperCase()}
          </div>
          <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: "0.05em", color: "var(--ink)", fontFamily: "var(--mono)" }}>
            {user?.name || "USER"}
          </span>
        </button>
      </div>
    </header>
  );
}
