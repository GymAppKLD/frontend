import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAllExercises } from "../../api/exerciseApi";
import { usePreferences } from "../../context/PreferencesContext";
import type { Exercise } from "../../types/exercise";

export default function Library() {
  const navigate = useNavigate();
  const { t, translateMuscle } = usePreferences();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAllExercises()
      .then(setExercises)
      .catch(() => setError("Failed to load exercises."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Exercise[]>>((acc, e) => {
    (acc[e.muscleGroup] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 64 }}>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("exercises")}</h1>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/exercises/create")}>
          + {t("addExercise")}
        </button>
      </div>

      <div className="field">
        <label>{t("")}</label>
        <div className="score-cell active" style={{ padding: 0, width: "100%", maxWidth: 480 }}>
          <input
            type="text"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="score-input"
            style={{ width: "100%", padding: "16px 24px", textAlign: "left", color: "var(--accent)" }}
          />
        </div>
      </div>

      {loading && <div style={{ color: "var(--muted)", margin: "40px 0", fontFamily: "var(--mono)" }}>[ {t("exercises").toUpperCase()}... ]</div>}
      {error && <div style={{ color: "var(--danger)", margin: "40px 0", fontFamily: "var(--mono)" }}>[ ERR: {error} ]</div>}

      {!loading && !error && Object.keys(grouped).length === 0 && (
        <div className="card" style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>[ {t("noResults").toUpperCase()} ]</div>
      )}

      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24, marginTop: 48 }}>
          {Object.entries(grouped)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([, list]) => 
              list.map((ex) => (
                <div 
                  key={ex.id}
                  className="card"
                  onClick={() => navigate(`/exercises/${ex.id}/progress`)}
                  style={{ 
                    cursor: "pointer",
                    transition: "transform 0.15s ease, border-color 0.15s ease",
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: "var(--ink)", letterSpacing: "-0.02em" }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginTop: 8 }}>{translateMuscle(ex.muscleGroup)}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--mono)", fontWeight: 800, letterSpacing: "0.1em", marginTop: "auto" }}>{t("progression").toUpperCase()} ➔</div>
                </div>
              ))
            )}
        </div>
      )}
    </div>
  );
}
