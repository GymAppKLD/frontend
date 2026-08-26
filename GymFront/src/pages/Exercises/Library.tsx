import { useEffect, useState } from "react";
import { fetchAllExercises } from "../../api/exerciseApi";
import type { Exercise } from "../../types/exercise";

export default function Library() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAllExercises()
      .then(setExercises)
      .catch(() => setError("Não foi possível carregar os exercícios."))
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
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Exercises</h1>
          <p className="page-sub">Browse and manage your exercise library</p>
        </div>
        <button className="btn btn-primary">+ New Exercise</button>
      </div>

      <div className="search" style={{ width: "100%", maxWidth: 400, marginBottom: 14 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises..."
          style={{
            border: "none",
            background: "transparent",
            outline: "none",
            font: "inherit",
            color: "inherit",
            width: "100%",
          }}
        />
      </div>

      {loading && <div className="card">Carregando...</div>}
      {error && <div className="card" style={{ color: "var(--pink)" }}>{error}</div>}

      {!loading && !error && Object.keys(grouped).length === 0 && (
        <div className="card">Nenhum exercício encontrado.</div>
      )}

      {!loading &&
        !error &&
        Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            <div className="section-label">{group}</div>
            <div className="grid g-3">
              {items.map((exercise) => (
                <div className="muscle-card" key={exercise.id}>
                  <div className="mname">{exercise.name}</div>
                  <div className="msub">{exercise.muscleGroup}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </>
  );
}