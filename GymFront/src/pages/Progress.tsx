import { useState, useEffect, useMemo } from "react";
import { fetchProgressOverview } from "../api/memberApi";
import type { ProgressOverviewDTO } from "../types/progress";

function LineChart({ points, h = 220, color = "var(--info)" }: { points: number[]; h?: number; color?: string }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  
  if (!points || points.length === 0) return null;
  const w = 680;
  const pad = 28;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min;
  
  const ys = points.map((v) => 
    range === 0 ? (h / 2) : h - 24 - ((v - min) / range) * (h - 48)
  );

  const gradId = `grad-${h}-${points.join("")}-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  if (points.length === 1) {
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ overflow: "visible" }}>
        <circle 
          cx={w / 2} cy={ys[0]} r="6" fill={color} stroke="var(--card)" strokeWidth="3" 
          onMouseEnter={() => setHoverIdx(0)} onMouseLeave={() => setHoverIdx(null)}
          style={{ cursor: "pointer", transition: "r 0.1s" }}
        />
        {hoverIdx === 0 && (
          <g>
            <rect x={(w/2) - 30} y={ys[0] - 32} width="60" height="24" rx="4" fill="var(--ink)" />
            <text x={w/2} y={ys[0] - 16} fill="var(--bg)" fontSize="12" fontFamily="var(--mono)" fontWeight="800" textAnchor="middle">{points[0].toFixed(1)}</text>
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
  const area = `${d} L${xs[xs.length - 1]},${h - 10} L${xs[0]},${h - 10} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.24 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} style={{ pointerEvents: "none" }} />
      <path d={d} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" style={{ pointerEvents: "none" }} />
      
      {xs.map((x, i) => (
        <g key={i}>
          <circle 
            cx={x} cy={ys[i]} r={hoverIdx === i ? 6 : 4} 
            fill={color} stroke="var(--card)" strokeWidth="3" 
            onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}
            style={{ cursor: "pointer", transition: "r 0.1s" }}
          />
          {hoverIdx === i && (
            <g style={{ pointerEvents: "none" }}>
              <rect x={x - 30} y={ys[i] - 32} width="60" height="24" rx="4" fill="var(--ink)" />
              <text x={x} y={ys[i] - 16} fill="var(--bg)" fontSize="12" fontFamily="var(--mono)" fontWeight="800" textAnchor="middle">{points[i].toFixed(1)}</text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

function formatPct(v: number): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

export default function Progress() {
  const [data, setData] = useState<ProgressOverviewDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [muscleFilter, setMuscleFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchProgressOverview()
      .then(setData)
      .catch(() => setError("Failed to load progress data."))
      .finally(() => setLoading(false));
  }, []);

  const allMuscles = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.weeklyVolume.map(w => w.muscleGroup));
    return Array.from(set).sort();
  }, [data]);

  const { volumePoints, volumeLabels } = useMemo(() => {
    if (!data) return { volumePoints: [], volumeLabels: [] };
    
    const filtered = muscleFilter === "ALL" 
      ? data.weeklyVolume 
      : data.weeklyVolume.filter(w => w.muscleGroup === muscleFilter);
      
    const byWeek = filtered.reduce((acc, curr) => {
      acc[curr.week] = (acc[curr.week] || 0) + curr.volumeSets;
      return acc;
    }, {} as Record<string, number>);
    
    const sortedWeeks = Object.keys(byWeek).sort();
    
    return {
      volumePoints: sortedWeeks.map(w => byWeek[w]),
      volumeLabels: sortedWeeks
    };
  }, [data, muscleFilter]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 64 }}>
      <div className="page-head" style={{ marginBottom: 48, marginTop: 16 }}>
        <div>
          <h1 className="page-title">PROGRESS OVERVIEW</h1>
        </div>
      </div>

      {loading && !data && <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontFamily: "monospace" }}>[ ASSEMBLING METRICS... ]</div>}
      {error && !data && <div style={{ color: "var(--danger)", margin: "40px 0", fontFamily: "monospace" }}>[ ERR: {error} ]</div>}

      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div className="card" style={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em" }}>WEEKLY SET VOLUME</div>
              
              {allMuscles.length > 0 && (
                <select 
                  value={muscleFilter} 
                  onChange={(e) => setMuscleFilter(e.target.value)}
                  style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--accent)", padding: "4px 8px", fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700 }}
                >
                  <option value="ALL">ALL MUSCLES</option>
                  {allMuscles.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              )}
            </div>
            
            {volumePoints.length === 0 ? (
              <p style={{ color: "var(--muted)", fontFamily: "var(--mono)" }}>[ NO VOLUME DATA ]</p>
            ) : (
              <>
                <LineChart points={volumePoints} h={220} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", marginTop: 16 }}>
                  {volumeLabels.map((l) => (
                    <span key={l}>{l.replace("-W", "W")}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="card" style={{ padding: 32 }}>
            <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>EXERCISE PROGRESS (E1RM)</div>
            {data.exercises.length === 0 ? (
              <p style={{ color: "var(--muted)", fontFamily: "var(--mono)" }}>[ NO EXERCISE DATA GATHERED YET ]</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "40%" }}>EXERCISE</th>
                    <th style={{ width: "20%" }}>DELTA</th>
                    <th style={{ width: "40%" }}>TREND (90D)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.exercises.map((e) => (
                    <tr key={e.exerciseName}>
                      <td style={{ fontWeight: 800, fontSize: 15, textTransform: "uppercase", color: "var(--ink)" }}>{e.exerciseName}</td>
                      <td>
                        <span className="score-cell" style={{ 
                          background: e.progressPct >= 0 ? "var(--success-glow)" : "var(--danger-glow)", 
                          color: e.progressPct >= 0 ? "var(--success)" : "var(--danger)", 
                          boxShadow: "none", 
                          fontSize: 13,
                          padding: "4px 8px" 
                        }}>
                          {formatPct(e.progressPct)} {e.progressPct >= 0 ? "↑" : "↓"}
                        </span>
                      </td>
                      <td style={{ width: 140, paddingTop: 24, paddingBottom: 24 }}>
                        <LineChart points={e.points} h={40} color={e.progressPct >= 0 ? "var(--success)" : "var(--danger)"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
