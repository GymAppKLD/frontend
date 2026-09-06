import { useState } from "react";

interface CustomDropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  ariaLabel?: string;
}

/**
 * Custom in-app dropdown that renders as a button + modal list,
 * avoiding the native system picker on mobile.
 */
export default function CustomDropdown({ value, options, onChange, ariaLabel }: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={ariaLabel}
        style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--accent)", padding: "6px 12px", fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
      >
        <span>{selected ? selected.label : value}</span>
        <span style={{ opacity: 0.7 }}>▾</span>
      </button>

      {open && (
        <div className="modal-backdrop" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
          <div className="modal-card" style={{ width: "100%", maxWidth: 320, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, maxHeight: "70vh", display: "flex", flexDirection: "column" }}>
            <div className="modal-card-head">
              <span style={{ fontSize: 12, fontFamily: "var(--mono)", letterSpacing: "0.1em", color: "var(--muted)" }}>{ariaLabel ?? ""}</span>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ overflowY: "auto", marginTop: 8 }}>
              {options.length === 0 ? (
                <div style={{ padding: 12, fontSize: 13, color: "var(--muted)", fontFamily: "var(--mono)" }}>—</div>
              ) : (
                options.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => { onChange(o.value); setOpen(false); }}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 14px", background: o.value === value ? "var(--accent-glow)" : "transparent", color: o.value === value ? "var(--accent)" : "var(--ink)", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 13 }}
                  >
                    {o.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}