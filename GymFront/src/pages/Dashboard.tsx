import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllWorkouts } from "../api/workoutApi";
import { fetchDashboardStats } from "../api/memberApi";
import { useAuth } from "../context/AuthContext";
import type { WorkoutSummary } from "../types/workout";
import type { DashboardStatsDTO } from "../types/progress";

const STAT_ICON_PATHS: Record<string, string> = {
  workouts: "M4 19V9a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v10 M15 19V9a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v10 M2 19h20 M9 12h6",
  volume: "M6 3v18M18 3v18M3 8h4M3 16h4M17 8h4M17 16h4",
  load: "M12 20V10M18 20V4M6 20v-4",
  trend: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
};

const MUSCLE_COLORS = [
  "var(--purple)",
  "var(--teal)",
  "var(--orange)",
  "var(--pink)",
  "var(--purple-deep)",
  "#6366f1",
];

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
  if (points.length < 2) return null;
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

function MuscleDonut({ groups }: { groups: { label: string; value: number; color: string }[] }) {
  const size = 140;
  const thickness = 16;
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const total = groups.reduce((s, g) => s + g.value, 0);
  let offset = 0;

  return (
    <div className="donut-wrap" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {groups.map((s) => {
          const pct = total > 0 ? s.value / total : 0;
          const len = circ * pct;
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

function formatKg(v: number): string {
  return v >= 1000 ? `${v.toLocaleString("en-US", { maximumFractionDigits: 0 })} sets` : `${v.toFixed(0)} sets`;
}

function formatPct(v: number): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStatsDTO | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetchDashboardStats(),
      fetchAllWorkouts(),
    ])
      .then(([s, w]) => {
        setStats(s);
        setRecentWorkouts(w.slice(0, 3));
      })
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, [token]);

  const statCards = stats
    ? [
        { icon: "workouts", num: String(stats.workoutsThisMonth), label: "Workouts this month", bg: "var(--purple-light)", color: "var(--purple)" },
        { icon: "volume", num: formatKg(stats.totalVolumeKg), label: "Total volume", bg: "var(--teal-light)", color: "var(--teal)" },
        { icon: "load", num: formatKg(stats.averageLoadKg), label: "Average load", bg: "var(--orange-light)", color: "var(--orange)" },
        { icon: "trend", num: formatPct(stats.overallProgressPct), label: "Overall progress", bg: "#FDEAF1", color: "var(--pink)", trend: stats.overallProgressPct >= 0 ? "up" as const : "down" as const },
      ]
    : null;

  const muscleGroups = stats
    ? (() => {
        const grouped: Record<string, number> = {};
        stats.priorityExercises.forEach((e) => {
          grouped[e.muscleGroup] = (grouped[e.muscleGroup] || 0) + e.volumeKg;
        });
        return Object.entries(grouped).map(([label, value], i) => ({
          label,
          value,
          color: MUSCLE_COLORS[i % MUSCLE_COLORS.length],
        }));
      })()
    : [];

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Track your performance and progression</p>
        </div>
      </div>

      {loading && !stats && (
        <div style={{ color: "var(--muted)", margin: "40px 0" }}>Loading...</div>
      )}

      {error && !stats && (
        <div style={{ color: "var(--pink)", margin: "40px 0" }}>{error}</div>
      )}

      {statCards && (
        <div className="grid g-4" style={{ marginBottom: 18 }}>
          {statCards.map((s) => (
            <div className="card stat-card" key={s.label}>
              <StatIcon icon={s.icon} bg={s.bg} color={s.color} />
              <div>
                <div className="stat-num">
                  {s.num}
                  {s.trend && <span className={`trend ${s.trend}`}>↑</span>}
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div className="grid g-main-side" style={{ marginBottom: 18 }}>
          <div className="card">
            <div className="card-head">
              <div className="card-title">Priority Exercises</div>
              <span className="chip" onClick={() => navigate("/exercises")}>+ Add Exercise</span>
            </div>
            {stats.priorityExercises.length === 0 && (
              <p style={{ color: "var(--muted)" }}>No exercise data yet.</p>
            )}
            <div className="grid g-3">
              {stats.priorityExercises.map((e) => (
                <div className="muscle-card" key={e.exerciseName}>
                  <div className="mname">{e.exerciseName}</div>
                  <div className="msub">{e.muscleGroup}</div>
                  <MiniLineChart points={e.points} colorVar="var(--purple)" />
                  <div className="mfoot">
                    <span className="mono-num" style={{ color: "var(--ink)" }}>{formatKg(e.volumeKg)}</span>
                    <span className={`trend ${e.progressPct >= 0 ? "up" : "down"}`}>{formatPct(e.progressPct)} ↑</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-head">
              <div className="card-title">Split by Muscle Group</div>
            </div>
            {muscleGroups.length > 0 ? (
              <>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <MuscleDonut groups={muscleGroups} />
                </div>
                <div className="legend">
                  {muscleGroups.map((s) => (
                    <div className="legend-item" key={s.label}>
                      <span className="dot" style={{ background: s.color }} />
                      {s.label}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ color: "var(--muted)" }}>No data yet.</p>
            )}
          </div>
        </div>
      )}

      <div className="grid g-main-side">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Recent Workouts</div>
            <span className="chip" onClick={() => navigate("/workouts")}>View all</span>
          </div>
          {recentWorkouts.length === 0 && !loading && (
            <p style={{ color: "var(--muted)" }}>Nenhum treino registrado ainda.</p>
          )}
          {recentWorkouts.length > 0 && (
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
        {stats && (
          <div
            className="card"
            style={{
              background: "linear-gradient(160deg,var(--purple),var(--purple-deep))",
              color: "var(--on-accent)",
              border: "none",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Sora',sans-serif" }}>
              {stats.setsLoggedThisWeek}
            </div>
            <div style={{ fontSize: 12.5, opacity: 0.85, marginBottom: 14 }}>Sets logged this week</div>
          </div>
        )}
      </div>
    </>
  );
}
