import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllWorkouts } from "../api/workoutApi";
import { fetchDashboardStats } from "../api/memberApi";
import { usePreferences } from "../context/PreferencesContext";
import type { WorkoutSummary } from "../types/workout";
import type { DashboardStatsDTO } from "../types/progress";

function MiniLineChart({ points, colorVar, h = 40, w = 140, width = "100%" }: { points: number[]; colorVar: string; h?: number; w?: number; width?: string | number }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!points || points.length === 0) return null;
  const pad = 12;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min;
  
  const ys = points.map((v) => 
    range === 0 ? (h / 2) : h - 8 - ((v - min) / range) * (h - 16)
  );

  if (points.length === 1) {
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width={width} height={h} style={{ overflow: "visible" }}>
        <circle 
          cx={w / 2} cy={ys[0]} r="4" fill={colorVar} stroke="var(--card)" strokeWidth="2" 
          onMouseEnter={() => setHoverIdx(0)} onMouseLeave={() => setHoverIdx(null)}
          style={{ cursor: "pointer", transition: "r 0.1s" }}
        />
        {hoverIdx === 0 && (
          <g style={{ pointerEvents: "none" }}>
            <rect x={(w/2) - 24} y={ys[0] - 28} width="48" height="20" rx="4" fill="var(--ink)" />
            <text x={w/2} y={ys[0] - 14} fill="var(--bg)" fontSize="10" fontFamily="var(--mono)" fontWeight="800" textAnchor="middle">{points[0].toFixed(1)}</text>
          </g>
        )}
      </svg>
    );
  }

  const xs = points.map((_, i) => pad + i * ((w - pad * 2) / (points.length - 1)));
  let d = `M${xs[0]},${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2;
    d += ` C${cx},${ys[i - 1]} ${cx},${ys[i]} ${xs[i]},${ys[i]}`;
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={width} height={h} style={{ overflow: "visible" }}>
      <path d={d} fill="none" stroke={colorVar} strokeWidth="2" strokeLinecap="round" style={{ pointerEvents: "none" }} />
      {xs.map((x, i) => (
        <g key={i}>
          <circle 
            cx={x} cy={ys[i]} r={hoverIdx === i ? 4 : 3} 
            fill={colorVar} stroke="var(--card)" strokeWidth="2" 
            onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}
            style={{ cursor: "pointer", transition: "r 0.1s" }}
          />
          {hoverIdx === i && (
            <g style={{ pointerEvents: "none" }}>
              <rect x={x - 24} y={ys[i] - 28} width="48" height="20" rx="4" fill="var(--ink)" />
              <text x={x} y={ys[i] - 14} fill="var(--bg)" fontSize="10" fontFamily="var(--mono)" fontWeight="800" textAnchor="middle">{points[i].toFixed(1)}</text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

function formatSets(v: number): string {
  return v >= 1000 ? `${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : `${v.toFixed(0)}`;
}

function formatPct(v: number): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, translateMuscle } = usePreferences();
  const [stats, setStats] = useState<DashboardStatsDTO | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avgExercise, setAvgExercise] = useState<string | null>(null);
  const [showAvgMenu, setShowAvgMenu] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchDashboardStats(),
      fetchAllWorkouts(false),
    ])
      .then(([s, w]) => {
        setStats(s);
        setRecentWorkouts(w.slice(0, 3));
        const exercises = Object.keys(s.averageLoadPerExercise).sort();
        if (exercises.length > 0) {
          setAvgExercise((prev) => prev ?? exercises[0]);
        }
      })
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const selectAvgExercise = (name: string) => {
    setAvgExercise(name);
    setShowAvgMenu(false);
  };

  const avgChartPoints = stats && avgExercise
    ? (stats.loadTrendPerExercise[avgExercise] ?? [])
    : [];
  const avgChartColor = "var(--info)";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 64 }}>
      
      {/* HEADER */}
      <div className="dash-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, marginTop: 8, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
        <div>
          <h1 className="dash-title" style={{ fontSize: 40, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.04em", textTransform: "uppercase", lineHeight: 1 }}>DASHBOARD</h1>
        </div>
        <div className="hide-mobile" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--success-glow)", color: "var(--success)", border: "1px solid var(--success)", borderRadius: 4, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" }}>
            <span style={{ display: "block", width: 8, height: 8, borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 8px var(--success)" }}></span>
            ONLINE
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--mono)" }}>{new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {loading && !stats && <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontFamily: "monospace" }}>[ GATHERING TELEMETRY... ]</div>}
      {error && !stats && <div style={{ color: "var(--danger)", margin: "40px 0", fontFamily: "monospace" }}>[ ERR: {error} ]</div>}

      {stats && (
        <div className="dash-main" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          
          {/* PRIMARY LED SCOREBOARD */}
          <div className="scoreboard-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <div className="dash-stat" style={{ background: "var(--card)", border: "1px solid var(--border)", padding: 24, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 12 }}>{t("workouts30d").toUpperCase()}</div>
              <div className="score-cell active" style={{ fontSize: 32, padding: "12px 24px" }}>{stats.workoutsThisMonth}</div>
            </div>
            
            <div className="dash-stat" style={{ background: "var(--card)", border: "1px solid var(--border)", padding: 24, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 12 }}>{t("totalSets30d").toUpperCase()}</div>
              <div className="score-cell success" style={{ fontSize: 32, padding: "12px 24px" }}>{formatSets(stats.totalVolumeKg)}</div>
            </div>

            <div className="dash-stat" style={{ background: "var(--card)", border: "1px solid var(--border)", padding: 24, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <button
                onClick={() => setShowAvgMenu((v) => !v)}
                title={avgExercise ?? t("averageLoadKg")}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
              >
                <div style={{ fontSize: 11, color: "var(--info)", fontFamily: "var(--mono)", letterSpacing: "0.1em", maxWidth: 180, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {avgExercise ? avgExercise : t("averageLoadKg").toUpperCase()}
                </div>
                <div className="score-cell" style={{ background: "var(--info-glow)", color: "var(--info)", boxShadow: "inset 0 0 0 1px var(--info)", fontSize: 32, padding: "12px 24px" }}>
                  {(avgExercise && stats.averageLoadPerExercise[avgExercise] != null ? stats.averageLoadPerExercise[avgExercise] : 0).toFixed(1)}
                </div>
                <div className="dash-avg-chart" style={{ width: "100%", marginTop: 4 }}>
                  <MiniLineChart points={avgChartPoints} colorVar={avgChartColor} h={40} w={140} width="100%" />
                </div>
              </button>

              {showAvgMenu && (
                <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 8, width: 200, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, boxShadow: "0 16px 40px rgba(0,0,0,0.4)", zIndex: 20, maxHeight: 220, overflowY: "auto", padding: 4 }}>
                  {Object.keys(stats.averageLoadPerExercise).sort().map((name) => (
                    <button
                      key={name}
                      onClick={() => selectAvgExercise(name)}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: name === avgExercise ? "var(--info-glow)" : "transparent", color: name === avgExercise ? "var(--info)" : "var(--ink)", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "var(--mono)", fontSize: 12 }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="dash-stat" style={{ background: "var(--card)", border: "1px solid var(--border)", padding: 24, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 12 }}>{t("overallProgress").toUpperCase()}</div>
              <div className="score-cell" style={{ background: stats.overallProgressPct >= 0 ? "var(--success-glow)" : "var(--danger-glow)", color: stats.overallProgressPct >= 0 ? "var(--success)" : "var(--danger)", boxShadow: `inset 0 0 0 1px ${stats.overallProgressPct >= 0 ? "var(--success)" : "var(--danger)"}`, fontSize: 32, padding: "12px 24px" }}>
                {formatPct(stats.overallProgressPct)}
              </div>
            </div>
          </div>

          <div className="dashboard-grid-2" style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr", gap: 32, alignItems: "start" }}>
            
            {/* PRIORITY EXERCISES - SCOREBOARD STYLE */}
            <div className="dash-priority-card" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: 24 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>{t("topPriorityExercises").toUpperCase()}</div>
              
              {stats.priorityExercises.length === 0 ? (
                <div style={{ fontFamily: "var(--mono)", color: "var(--muted)", fontSize: 13 }}>[ {t("noData").toUpperCase()} ]</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {stats.priorityExercises.map((e, i) => (
                    <div className="dash-priority-row" key={e.exerciseName} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: i < stats.priorityExercises.length - 1 ? "1px dashed var(--border)" : "none" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 18, color: "var(--ink)", marginBottom: 4 }}>{e.exerciseName}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>{translateMuscle(e.muscleGroup)}</div>
                      </div>
                      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                        <div className="dash-priority-chart" style={{ paddingTop: 16 }}>
                          <MiniLineChart points={e.points} colorVar={e.progressPct >= 0 ? "var(--success)" : "var(--danger)"} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                          <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em" }}>{t("progression").toUpperCase()}</span>
                          <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 14, color: e.progressPct >= 0 ? "var(--success)" : "var(--danger)" }}>
                            {formatPct(e.progressPct)}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                          <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em" }}>E1RM (KG)</span>
                          <div className="score-cell active" style={{ fontSize: 20, padding: "4px 12px" }}>
                            {e.points.length > 0 ? e.points[e.points.length - 1].toFixed(1) : "0.0"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECONDARY STATS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: 24 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>{t("volumePerMuscle").toUpperCase()}</div>
                {Object.keys(stats.weeklyVolumePerMuscle).length === 0 ? (
                  <div style={{ fontFamily: "var(--mono)", color: "var(--muted)", fontSize: 13 }}>[ {t("noData").toUpperCase()} ]</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {Object.entries(stats.weeklyVolumePerMuscle)
                      .sort((a, b) => b[1] - a[1])
                      .map(([muscle, sets]) => (
                        <div key={muscle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 800, fontSize: 14, color: "var(--ink)" }}>{translateMuscle(muscle)}</span>
                          <span className="score-cell active" style={{ fontSize: 14, padding: "2px 8px" }}>{sets} {t("sets").toUpperCase()}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: 24 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>{t("recentLogs").toUpperCase()}</div>
                {recentWorkouts.length === 0 ? (
                  <div style={{ fontFamily: "var(--mono)", color: "var(--muted)", fontSize: 13 }}>[ {t("noData").toUpperCase()} ]</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {recentWorkouts.map(w => (
                      <div key={w.id} onClick={() => navigate(`/workouts/${w.id}`)} style={{ display: "flex", justifyContent: "space-between", cursor: "pointer" }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", textTransform: "uppercase" }}>{w.name}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>{new Date(w.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
