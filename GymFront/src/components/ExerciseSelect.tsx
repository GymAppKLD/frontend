import { useState } from "react";
import { usePreferences } from "../context/PreferencesContext";
import type { Exercise } from "../types/exercise";

interface ExerciseSelectProps {
  exercises: Exercise[];
  value: string;
  onChange: (id: string) => void;
}

export default function ExerciseSelect({ exercises, value, onChange }: ExerciseSelectProps) {
  const { t, translateMuscle } = usePreferences();
  const [open, setOpen] = useState(false);
  const selected = exercises.find((e) => e.id === value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ width: "100%", textAlign: "left", background: "var(--faint)", border: "1px solid var(--border)", color: "var(--ink)", padding: "14px 16px", borderRadius: 4, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected ? `${selected.name} (${translateMuscle(selected.muscleGroup)})` : t("selectExercise")}
        </span>
        <span style={{ color: "var(--accent)", flexShrink: 0 }}>▾</span>
      </button>

      {open && (
        <div className="modal-backdrop" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
          <div className="modal-card" style={{ width: "100%", maxWidth: 440, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: 20, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div className="modal-card-head">
              <span style={{ fontSize: 12, fontFamily: "var(--mono)", letterSpacing: "0.1em", color: "var(--muted)" }}>
                {t("selectExercise").toUpperCase()}
              </span>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ overflowY: "auto", marginTop: 8 }}>
              {exercises.length === 0 ? (
                <div style={{ padding: 16, fontSize: 13, color: "var(--muted)", fontFamily: "var(--mono)" }}>
                  [ {t("noResults").toUpperCase()} ]
                </div>
              ) : (
                exercises.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => { onChange(e.id); setOpen(false); }}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 14px", background: e.id === value ? "var(--accent-glow)" : "transparent", color: e.id === value ? "var(--accent)" : "var(--ink)", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 13 }}
                  >
                    {e.name}
                    <span style={{ display: "block", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{translateMuscle(e.muscleGroup)}</span>
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