import { useState, useEffect } from "react";
import { fetchProgressOverview } from "../api/memberApi";
import { useAuth } from "../context/AuthContext";
import type { ProgressOverviewDTO } from "../types/progress";

function LineChart({ points, h = 220 }: { points: number[]; h?: number }) {
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
  const gradId = `grad-${h}-${points.join("")}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--teal)", stopOpacity: 0.24 }} />
          <stop offset="100%" style={{ stopColor: "var(--teal)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={d} fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="4" fill="var(--teal)" stroke="var(--card)" strokeWidth="2" />
      ))}
    </svg>
  );
}

function formatPct(v: number): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

export default function Progress() {
  const { token } = useAuth();
  const [data, setData] = useState<ProgressOverviewDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchProgressOverview()
      .then(setData)
      .catch(() => setError("Failed to load progress data."))
      .finally(() => setLoading(false));
  }, [token]);

  const volumePoints = data ? data.monthlyVolume.map((m) => m.volumeKg) : [];
  const volumeLabels = data ? data.monthlyVolume.map((m) => m.month) : [];

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Progress</h1>
          <p className="page-sub">Understand your performance over time</p>
        </div>
      </div>

      {loading && !data && (
        <div style={{ color: "var(--muted)", margin: "40px 0" }}>Loading...</div>
      )}

      {error && !data && (
        <div style={{ color: "var(--pink)", margin: "40px 0" }}>{error}</div>
      )}

      {data && (
        <>
          {volumePoints.length >= 2 && (
            <div className="card" style={{ marginBottom: 18 }}>
              <div className="card-title" style={{ marginBottom: 14 }}>Overall Training Volume</div>
              <LineChart points={volumePoints} h={220} />
              {volumeLabels.length > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--faint)", marginTop: 6 }}>
                  {volumeLabels.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Exercise Progress</div>
            {data.exercises.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>No exercise data yet.</p>
            ) : (
              <table>
                <thead>
                  <tr><th>Exercise</th><th>Progress</th><th>Trend</th></tr>
                </thead>
                <tbody>
                  {data.exercises.map((e) => (
                    <tr key={e.exerciseName}>
                      <td style={{ fontWeight: 600 }}>{e.exerciseName}</td>
                      <td className={`trend ${e.progressPct >= 0 ? "up" : "down"}`}>
                        {formatPct(e.progressPct)} {e.progressPct >= 0 ? "↑" : "↓"}
                      </td>
                      <td style={{ width: 140 }}>
                        <LineChart points={e.points} h={40} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </>
  );
}
