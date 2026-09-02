import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  addSet, 
  completeWorkout, 
  updateExerciseLogNotes,
  fetchWorkoutById
} from "../../api/workoutApi";
import { fetchAllExercises, fetchPreviousNote } from "../../api/exerciseApi";
import type { Exercise } from "../../types/exercise";
import type { PreviousNote } from "../../api/exerciseApi";
import type { WorkoutResponse } from "../../types/workout";

export default function LogWorkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionIdParam = searchParams.get("sessionId");

  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<WorkoutResponse | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [setInputs, setSetInputs] = useState<Record<string, { weightKg: string, reps: string }>>({});
  const [sessionNoteInputs, setSessionNoteInputs] = useState<Record<string, string>>({});
  const [previousNotes, setPreviousNotes] = useState<Record<string, PreviousNote | null>>({});

  useEffect(() => {
    if (!sessionIdParam) {
      setError("Nenhum sessão selecionada.");
      setLoading(false);
      return;
    }

    fetchAllExercises()
      .then(list => setAvailableExercises(list))
      .catch(console.error);

    setSessionId(sessionIdParam);
    refreshSession(sessionIdParam)
      .catch(() => setError("Erro ao carregar sessão."))
      .finally(() => setLoading(false));
  }, [sessionIdParam]);

  const refreshSession = async (id: string) => {
    try {
      const data = await fetchWorkoutById(id);
      setActiveSession(data);
      
      const newSetInputs = { ...setInputs };
      const newSessionNoteInputs = { ...sessionNoteInputs };
      
      data.exercises.forEach(ex => {
        if (!newSetInputs[ex.id]) newSetInputs[ex.id] = { weightKg: "", reps: "" };
        if (newSessionNoteInputs[ex.id] === undefined) newSessionNoteInputs[ex.id] = ex.logNotes || "";
      });
      setSetInputs(newSetInputs);
      setSessionNoteInputs(newSessionNoteInputs);
      
      if (availableExercises.length > 0) {
        data.exercises.forEach(ex => {
          const baseEx = availableExercises.find(a => a.name === ex.exerciseName);
          if (baseEx && previousNotes[ex.id] === undefined) {
            fetchPreviousNote(baseEx.id).then(note => {
              setPreviousNotes(prev => ({ ...prev, [ex.id]: note }));
            });
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeSession && availableExercises.length > 0) {
      activeSession.exercises.forEach(ex => {
        const baseEx = availableExercises.find(a => a.name === ex.exerciseName);
        if (baseEx && previousNotes[ex.id] === undefined) {
          fetchPreviousNote(baseEx.id).then(note => {
            setPreviousNotes(prev => ({ ...prev, [ex.id]: note }));
          });
        }
      });
    }
  }, [availableExercises, activeSession]);

  const handleSaveSessionNote = async (workoutExerciseId: string) => {
    if (!sessionId) return;
    try {
      await updateExerciseLogNotes(sessionId, workoutExerciseId, sessionNoteInputs[workoutExerciseId]);
    } catch {
      alert("Erro ao salvar nota.");
    }
  };

  const handleLogSet = async (workoutExerciseId: string) => {
    if (!sessionId) return;
    const input = setInputs[workoutExerciseId];
    if (!input) return;
    const reps = Number(String(input.reps).trim());
    const weightKg = Number(String(input.weightKg).trim());
    if (!Number.isFinite(reps) || reps < 1) {
      alert("Reps must be a positive integer (>=1).");
      return;
    }
    if (!Number.isFinite(weightKg) || weightKg < 0) {
      alert("Load must be a number (>= 0).");
      return;
    }
    
    try {
      await addSet(sessionId, workoutExerciseId, reps, weightKg);
      setSetInputs(prev => ({ ...prev, [workoutExerciseId]: { weightKg: "", reps: "" }}));
      await refreshSession(sessionId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message;
      const serverMsg = msg && msg.includes("weightKg") ? "Weight must be >= 0 (" + msg + ")" : (msg && msg.includes("reps") ? "Reps must be > 0 (" + msg + ")" : msg);
      alert(serverMsg ? "Erro ao salvar série: " + serverMsg : "Erro ao salvar série.");
    }
  };

  const handleFinishSession = async () => {
    if (!sessionId) return;
    setFinishing(true);
    try {
      await completeWorkout(sessionId);
      navigate(`/workouts/${sessionId}`);
    } catch {
      alert("Failed to finish session.");
      setFinishing(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontFamily: "monospace" }}>[ INITIATING SEQUENCE... ]</div>;
  
  if (error) return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "monospace" }}>
      <p style={{ color: "var(--pink)", marginBottom: 24 }}>[ ERR: {error} ]</p>
      <button onClick={() => navigate("/workouts")} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--ink)", padding: "12px 24px", cursor: "pointer", textTransform: "uppercase" }}>ABORT</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", paddingBottom: 64 }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, marginTop: 16, borderBottom: "1px solid var(--border)", paddingBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 8 }}>SESSION_ID: {sessionId?.split('-')[0]}</div>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.04em", lineHeight: 1 }}>{activeSession?.name}</h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--success-glow)", color: "var(--success)", border: "1px solid var(--success)", borderRadius: 4, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" }}>
            <span style={{ display: "block", width: 8, height: 8, borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 8px var(--success)" }}></span>
            ACTIVE
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "monospace" }}>{new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* EXERCISES */}
      <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
        {activeSession?.exercises.map((ex, i) => {
          const prev = previousNotes[ex.id];
          
          return (
            <div key={ex.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
              
              {/* EXERCISE HEADER */}
              <div style={{ padding: "20px 24px", background: "var(--faint)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{String(i + 1).padStart(2, '0')} - {ex.exerciseName}</div>
                </div>
                {prev ? (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>PREVIOUS ({prev.daysElapsed}D)</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--muted)", fontFamily: "monospace" }}>
                      {prev.bestWeightKg !== null ? `${prev.bestWeightKg}kg x ${prev.bestReps}` : '--'}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>NO HISTORY</div>
                )}
              </div>

              <div style={{ padding: "24px" }}>
                {ex.notes && (
                  <div style={{ marginBottom: 16, padding: "12px 16px", background: "var(--faint)", borderRadius: 4, borderLeft: "2px solid var(--accent)", fontSize: 13 }}>
                    <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 4 }}>ORIENTATION</div>
                    <div>{ex.notes}</div>
                  </div>
                )}
                <div style={{ marginBottom: 24 }}>
                  <input 
                    className="score-input"
                    placeholder="Session note (e.g. slept bad, different time)..."
                    value={sessionNoteInputs[ex.id] || ""}
                    onChange={(e) => setSessionNoteInputs(prev => ({ ...prev, [ex.id]: e.target.value }))}
                    onBlur={() => handleSaveSessionNote(ex.id)}
                    style={{ textAlign: "left", fontSize: 14, color: "var(--ink)", borderBottom: "1px dashed var(--border)", paddingBottom: 8 }}
                  />
                </div>

                {/* LOGGING TABLE */}
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "center", color: "var(--muted)", fontSize: 11, paddingBottom: 8 }}>SET</th>
                      <th style={{ textAlign: "center", color: "var(--muted)", fontSize: 11, paddingBottom: 8 }}>LOAD (KG)</th>
                      <th style={{ textAlign: "center", color: "var(--muted)", fontSize: 11, paddingBottom: 8 }}>REPS</th>
                      <th style={{ width: 80 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* COMPLETED SETS */}
                    {ex.sets.map((set) => (
                      <tr key={set.setNumber}>
                        <td style={{ textAlign: "center", color: "var(--muted)", fontWeight: 700 }}>{set.setNumber}</td>
                        <td style={{ textAlign: "center" }}><div className="score-cell success">{set.weightKg.toFixed(1)}</div></td>
                        <td style={{ textAlign: "center" }}><div className="score-cell success">{set.reps}</div></td>
                        <td style={{ textAlign: "center" }}>
                          <div style={{ display: "inline-flex", padding: "8px", color: "var(--success)" }}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {/* ACTIVE INPUT ROW */}
                    <tr>
                      <td style={{ textAlign: "center", color: "var(--accent)", fontWeight: 800 }}>{ex.sets.length + 1}</td>
                      <td style={{ textAlign: "center" }}>
                        <div className="score-cell active" style={{ padding: 0 }}>
                          <input 
                            type="number" 
                            className="score-input"
                            placeholder="0.0" 
                            value={setInputs[ex.id]?.weightKg || ""}
                            onChange={(e) => setSetInputs(p => ({ ...p, [ex.id]: { ...p[ex.id], weightKg: e.target.value } }))}
                            style={{ padding: "8px 12px", width: 100 }}
                          />
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div className="score-cell active" style={{ padding: 0 }}>
                          <input 
                            type="number" 
                            className="score-input"
                            placeholder="0" 
                            value={setInputs[ex.id]?.reps || ""}
                            onChange={(e) => setSetInputs(p => ({ ...p, [ex.id]: { ...p[ex.id], reps: e.target.value } }))}
                            style={{ padding: "8px 12px", width: 80 }}
                          />
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button 
                          onClick={() => handleLogSet(ex.id)}
                          style={{ background: "var(--accent)", color: "var(--bg)", border: "none", width: 40, height: 40, borderRadius: 4, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {activeSession && activeSession.exercises.length > 0 && (
          <button 
            onClick={handleFinishSession}
            disabled={finishing}
            style={{ 
              background: finishing ? "var(--faint)" : "var(--ink)", 
              color: finishing ? "var(--muted)" : "var(--bg)", 
              border: "none", 
              padding: "24px", 
              borderRadius: 8, 
              fontSize: 18, 
              fontWeight: 800, 
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              cursor: finishing ? "not-allowed" : "pointer",
              boxShadow: finishing ? "none" : "0 8px 24px rgba(0,0,0,0.4)",
              transition: "all 0.2s ease"
            }}
            >
              {finishing ? "SAVING..." : "SAVE SESSION"}
            </button>
        )}
      </div>
    </div>
  );
}
