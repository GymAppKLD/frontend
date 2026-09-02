export default function Topbar() {
  return (
    <header className="topbar" style={{ background: "#060607", borderBottom: "1px solid var(--border)" }}>
      <div className="search-bar" style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 2 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ opacity: 0.5 }}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input 
          type="text" 
          placeholder="SEARCH..." 
          style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.05em", color: "var(--muted)", textTransform: "uppercase" }}
        />
      </div>
      
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        {/* System Status Indicators */}
        <div style={{ display: "flex", gap: 16, paddingRight: 24, borderRight: "1px solid var(--border)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
            <div style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--muted)", letterSpacing: "0.1em" }}>NET</div>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: "var(--success)", boxShadow: "0 0 8px var(--success-glow)" }}></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
            <div style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--muted)", letterSpacing: "0.1em" }}>SYNC</div>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)" }}></div>
          </div>
        </div>

        {/* Notifications / Alerts */}
        <div style={{ 
          width: 32, height: 32, background: "transparent", color: "var(--muted)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          border: "1px solid var(--border)", borderRadius: 2, position: "relative"
        }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          {/* Notification dot */}
          <div style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, borderRadius: 4, background: "var(--danger)", boxShadow: "0 0 8px var(--danger-glow)" }}></div>
        </div>

        {/* Operator Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ 
            width: 32, height: 32, borderRadius: 2, background: "var(--faint)", color: "var(--ink)",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14,
            border: "1px solid var(--border)", fontFamily: "var(--mono)"
          }}>
            OP
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink)", fontFamily: "var(--mono)" }}>
              Gabriel
            </div>
            <div style={{ fontSize: 9, color: "var(--accent)", fontFamily: "var(--mono)", letterSpacing: "0.1em" }}>
              USER
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
