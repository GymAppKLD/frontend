import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllWorkouts } from "../api/workoutApi";
import type { WorkoutSummary } from "../types/workout";

function monthLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function dayLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function History() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAllWorkouts()
      .then(setWorkouts)
      .catch(() => setError("Não foi possível carregar o histórico."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = workouts.filter((w) =>
    w.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  // backend already returns workouts ordered by createdAt desc, so grouping
  // preserves chronological order within and across months
  const groups: { month: string; items: WorkoutSummary[] }[] = [];
  for (const w of filtered) {
    const month = monthLabel(w.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.month === month) {
      last.items.push(w);
    } else {
      groups.push({ month, items: [w] });
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">History</h1>
          <p className="page-sub">Your complete training timeline</p>
        </div>
      </div>

      <div className="search" style={{ width: "100%", maxWidth: 320, marginBottom: 14 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search workouts..."
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
      {!loading && !error && groups.length === 0 && (
        <div className="card">Nenhum treino encontrado.</div>
      )}

      {!loading && !error && groups.length > 0 && (
        <div className="card">
          {groups.map((group) => (
            <div key={group.month}>
              <div className="tl-month">{group.month}</div>
              {group.items.map((w, i) => (
                <div
                  className="tl-item"
                  key={w.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/workouts/${w.id}`)}
                >
                  <div className="tl-rail">
                    <div className="tl-dot" />
                    {i < group.items.length - 1 && <div className="tl-line" />}
                  </div>
                  <div className="tl-body">
                    <div className="tl-day">{dayLabel(w.createdAt)}</div>
                    <div className="tl-title">{w.name}</div>
                    <div className="tl-meta">{w.exerciseCount} exercises</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}