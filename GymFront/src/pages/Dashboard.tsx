import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllWorkouts } from "../api/workoutApi";
import type { WorkoutSummary } from "../types/workout";

// --- mock data (aggregate stats not yet exposed by the backend) ---
const STATS = [
  { icon: "workouts", num: "24", label: "Workouts this month", bg: "var(--purple-light)", color: "var(--purple)" },
  { icon: "volume", num: "12,450 kg", label: "Total volume", bg: "var(--teal-light)", color: "var(--teal)" },
  { icon: "load", num: "74.4 kg", label: "Average load", bg: "var(--orange-light)", color: "var(--orange)" },
  { icon: "trend", num: "+18.4%", label: "Overall progress", bg: "#FDEAF1", color: "var(--pink)", trend: "up" },
];

const PRIORITY_EXERCISES = [
  { name: "Bench Press", group: "Chest & Triceps", vol: "2,530 kg", pct: "+30.4%", points: [3, 5, 4, 7, 6, 9, 8] },
  { name: "Barbell Squat", group: "Lower 2", vol: "2,860 kg", pct: "+18.2%", points: [4, 5, 5, 6, 7, 8, 9] },
  { name: "Deadlift", group: "Lower 1", vol: "4,120 kg", pct: "+24.1%", points: [2, 4, 5, 6, 7, 7, 9] },
];

const MUSCLE_SPLIT = [
  { label: "Chest", value: 28, color: "var(--purple)" },
  { label: "Legs", value: 34, color: "var(--teal)" },
  { label: "Back", value: 22, color: "var(--orange)" },
  { label: "Arms", value: 16, color: "var(--pink)" },
];

const SETS_THIS_WEEK = { total: 232, points: [4, 6, 5, 8, 7, 10, 9] };

const STAT_ICON_PATHS: Record<string, string> = {
  workouts: "M4 19V9a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v10 M15 19V9a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v10 M2 19h20 M9 12h6",
  volume: "M6 3v18M18 3v18M3 8h4M3 16h4M17 8h4M17 16h4",
  load: "M12 20V10M18 20V4M6 20v-4",
  trend: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
};

function StatIcon({ icon, bg, color }: { icon: string; bg: string; color: string }) {
  return (
    <div className="stat-icon" style={{ background: bg }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        {STAT_ICON_PATHS[icon].split(" M").map((d, i) => (
          <path key={i} d={i === 0 ? d : "M" + d} />
        ))}
      </svg>
    </div>
  );
}

function MiniLineChart({ points, colorVar, h = 90 }: { points: number[]; colorVar: string; h?: number }) {
  const w = 680;
  const pad = 28;
  const xs = points.map((_, i) => pad + i * ((w - pad * 2) / (points.length - 1)));
  const max = Math.max(...points);
  const min = Math.min(...points);
  const ys = points.map((v) => h - 24 - ((v - min) / (max - min || 1)) * (h - 60));

  let d = `M${xs[0]},${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2;
    d += ` C${cx},${ys[i - 1]} ${cx},${ys[i]} ${xs[i]},${ys[i]}`;
  }
  const area = `${d} L${xs[xs.length - 1]},${h - 10} L${xs[0]},${h - 10} Z`;
  const gradId = `grad-${colorVar.replace(/[^a-z0-9]/gi, "")}-${points.join("")}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: colorVar, stopOpacity: 0.24 }} />
          <stop offset="100%" style={{ stopColor: colorVar, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={d} fill="none" stroke={colorVar} strokeWidth="2.5" strokeLinecap="round" />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="4" fill={colorVar} stroke="var(--card)" strokeWidth="2" />
      ))}
    </svg>
  );
}

function MuscleDonut() {
  const size = 140;
  const thickness = 16;
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="donut-wrap" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {MUSCLE_SPLIT.map((s) => {
          const len = circ * (s.value / 100);
          const el = (
            <circle
              key={s.label}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${c} ${c})`}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="donut-center">
        <div className="v">100%</div>
        <div className="l">Logged</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllWorkouts()
      .then((w) => setRecentWorkouts(w.slice(0, 3)))
      .catch(() => setError("Não foi possível carregar os treinos recentes."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Track your performance and progression</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/workouts/log")}>
          + Log Workout
        </button>
      </div>

      <div className="grid g-4" style={{ marginBottom: 18 }}>
        {STATS.map((s) => (
          <div className="card stat-card" key={s.label}>
            <StatIcon icon={s.icon} bg={s.bg} color={s.color} />
            <div>
              <div className="stat-num">
                {s.num}
                {s.trend && <span className="trend up">↑</span>}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid g-main-side" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title">Priority Exercises</div>
            <span className="chip" onClick={() => navigate("/exercises")}>+ Add Exercise</span>
          </div>
          <div className="grid g-3">
            {PRIORITY_EXERCISES.map((e) => (
              <div className="muscle-card" key={e.name}>
                <div className="mname">{e.name}</div>
                <div className="msub">{e.group}</div>
                <MiniLineChart points={e.points} colorVar="var(--purple)" />
                <div className="mfoot">
                  <span className="mono-num" style={{ color: "var(--ink)" }}>{e.vol}</span>
                  <span className="trend up">{e.pct} ↑</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <div className="card-title">Split by Muscle Group</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <MuscleDonut />
          </div>
          <div className="legend">
            {MUSCLE_SPLIT.map((s) => (
              <div className="legend-item" key={s.label}>
                <span className="dot" style={{ background: s.color }} />
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid g-main-side">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Recent Workouts</div>
            <span className="chip" onClick={() => navigate("/workouts")}>View all</span>
          </div>
          {loading && <p style={{ color: "var(--muted)" }}>Carregando...</p>}
          {error && <p style={{ color: "var(--pink)" }}>{error}</p>}
          {!loading && !error && recentWorkouts.length === 0 && (
            <p style={{ color: "var(--muted)" }}>Nenhum treino registrado ainda.</p>
          )}
          {!loading && !error && recentWorkouts.length > 0 && (
            <table>
              <tbody>
                {recentWorkouts.map((w) => (
                  <tr
                    key={w.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/workouts/${w.id}`)}
                  >
                    <td style={{ color: "var(--muted)", width: 90 }}>
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>{w.name}</td>
                    <td style={{ textAlign: "right", color: "var(--muted)" }}>
                      {w.exerciseCount} exercises
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div
          className="card"
          style={{
            background: "linear-gradient(160deg,var(--purple),var(--purple-deep))",
            color: "var(--on-accent)",
            border: "none",
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Sora',sans-serif" }}>
            {SETS_THIS_WEEK.total}
          </div>
          <div style={{ fontSize: 12.5, opacity: 0.85, marginBottom: 14 }}>Sets logged this week</div>
          <MiniLineChart points={SETS_THIS_WEEK.points} colorVar="var(--on-accent)" />
        </div>
      </div>
    </>
  );
}