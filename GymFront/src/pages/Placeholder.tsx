interface PlaceholderProps {
  title: string;
  subtitle?: string;
}

export default function Placeholder({ title, subtitle }: PlaceholderProps) {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, marginTop: 16, borderBottom: "1px solid var(--border)", paddingBottom: 24 }}>
        <div><div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.15em" }}>SYS // STANDBY</div><h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em", textTransform: "uppercase" }}>{title}</h1>{subtitle && <p style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.1em", marginTop: 8 }}>{subtitle}</p>}</div>
        <div className="score-cell" style={{ fontSize: 11 }}>LOCKED</div>
      </div>
      <div className="card" style={{ textAlign: "center", padding: 64 }}>
        <div style={{ width: 48, height: 48, border: "1px dashed var(--border)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>◌</div>
        <p style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.1em" }}>[ MODULE OFFLINE — NEXT PHASE ]</p>
      </div>
    </div>
  );
}