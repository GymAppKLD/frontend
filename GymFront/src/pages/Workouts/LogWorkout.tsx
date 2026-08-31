import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  addSet, 
  completeWorkout, 
  updateExerciseNote,
  fetchWorkoutById,
  startFromTemplate
} from "../../api/workoutApi";
import { fetchAllExercises, fetchPreviousNote } from "../../api/exerciseApi";
import type { Exercise } from "../../types/exercise";
import type { PreviousNote } from "../../api/exerciseApi";
import type { WorkoutResponse } from "../../types/workout";

export default function LogWorkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateIdParam = searchParams.get("templateId");

  // Reference Data
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  
  // Active Session State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<WorkoutResponse | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Local state for Sets & Notes being typed in the session
  const [setInputs, setSetInputs] = useState<Record<string, { weightKg: string, reps: string }>>({});
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [previousNotes, setPreviousNotes] = useState<Record<string, PreviousNote | null>>({});

  useEffect(() => {
    if (!templateIdParam) {
      setError("Nenhum template selecionado para iniciar a sessão.");
      setLoading(false);
      return;
    }

    // Load exercises reference
    fetchAllExercises()
      .then(list => setAvailableExercises(list))
      .catch(() => console.error("Could not load exercises reference"));

    // Start session
    startFromTemplate(templateIdParam)
      .then(res => {
        setSessionId(res.id);
        return refreshSession(res.id);
      })
      .catch(() => setError("Não foi possível iniciar a sessão a partir deste template."))
      .finally(() => setLoading(false));
  }, [templateIdParam]);

  const refreshSession = async (id: string) => {
    try {
      const data = await fetchWorkoutById(id);
      setActiveSession(data);
      
      const newSetInputs = { ...setInputs };
      const newNoteInputs = { ...noteInputs };
      
      data.exercises.forEach(ex => {
        if (!newSetInputs[ex.id]) newSetInputs[ex.id] = { weightKg: "", reps: "" };
        if (newNoteInputs[ex.id] === undefined) newNoteInputs[ex.id] = ex.notes || "";
      });
      setSetInputs(newSetInputs);
      setNoteInputs(newNoteInputs);
      
      // Lookback query
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

  // Re-run lookback when availableExercises finally load (in case they loaded after the session)
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

  const handleSaveNote = async (workoutExerciseId: string) => {
    if (!sessionId) return;
    try {
      await updateExerciseNote(sessionId, workoutExerciseId, noteInputs[workoutExerciseId]);
    } catch {
      alert("Erro ao salvar nota.");
    }
  };

  const handleLogSet = async (workoutExerciseId: string) => {
    if (!sessionId) return;
    const input = setInputs[workoutExerciseId];
    if (!input || !input.weightKg || !input.reps) return;
    
    try {
      await addSet(sessionId, workoutExerciseId, Number(input.reps), Number(input.weightKg));
      setSetInputs(prev => ({ ...prev, [workoutExerciseId]: { weightKg: "", reps: "" }}));
      await refreshSession(sessionId);
    } catch {
      alert("Erro ao salvar série.");
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

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Iniciando sessão...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p style={{ color: "var(--pink)", marginBottom: 16 }}>{error}</p>
        <button className="btn btn-outline" onClick={() => navigate("/workouts")}>Voltar para Workouts</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="card" style={{ padding: "32px 24px" }}>
        <div style={{ paddingBottom: 24, borderBottom: "1px dashed var(--border)", marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 24, color: "var(--ink)" }}>Treino Ativo: {activeSession?.name}</div>
            <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>Data: {new Date().toLocaleDateString()}</div>
          </div>
          <span className="chip" style={{ background: "var(--teal-light)", color: "var(--teal)", padding: "6px 12px" }}>● EM ANDAMENTO</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {activeSession?.exercises.map((ex, i) => {
            const prev = previousNotes[ex.id];
            
            return (
              <div key={ex.id}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, color: "var(--ink)" }}>
                  {i + 1}. {ex.exerciseName}
                </div>

                {prev ? (
                  <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, background: "var(--bg)", padding: "8px 12px", borderRadius: 8 }}>
                    <span>🗓️ Último ({new Date(prev.date).toLocaleDateString()} • há {prev.daysElapsed}d):</span>
                    <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                      {prev.bestWeightKg !== null ? `${prev.bestWeightKg}kg - ${prev.setsCount}x${prev.bestReps}` : 'Apenas nota'}
                    </span>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, fontStyle: "italic" }}>
                    Nenhum histórico recente encontrado.
                  </div>
                )}

                <div className="field-row" style={{ marginBottom: 20 }}>
                  <input 
                    placeholder="Nota qualitativa / Orientações..."
                    value={noteInputs[ex.id] || ""}
                    onChange={(e) => setNoteInputs(prevData => ({ ...prevData, [ex.id]: e.target.value }))}
                    onBlur={() => handleSaveNote(ex.id)}
                    style={{ fontSize: 14, background: "var(--card)", border: "1px solid var(--border)" }}
                  />
                </div>

                <table style={{ marginBottom: 12 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 60, fontSize: 12, color: "var(--muted)" }}>SET</th>
                      <th style={{ fontSize: 12, color: "var(--muted)" }}>CARGA(KG)</th>
                      <th style={{ fontSize: 12, color: "var(--muted)" }}>REPS</th>
                      <th style={{ width: 60, textAlign: "center", fontSize: 12, color: "var(--muted)" }}>CHECK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ex.sets.map((set) => (
                      <tr key={set.setNumber}>
                        <td style={{ fontWeight: 600, color: "var(--muted)" }}>{set.setNumber}</td>
                        <td><div className="chip" style={{ fontSize: 15 }}>{set.weightKg}</div></td>
                        <td><div className="chip" style={{ fontSize: 15 }}>{set.reps}</div></td>
                        <td style={{ textAlign: "center", color: "var(--teal)", fontSize: 18 }}>✓</td>
                      </tr>
                    ))}
                    
                    <tr>
                      <td style={{ color: "var(--faint)", fontWeight: 600 }}>{ex.sets.length + 1}</td>
                      <td>
                        <input 
                          type="number" 
                          placeholder="0.0" 
                          value={setInputs[ex.id]?.weightKg || ""}
                          onChange={(e) => setSetInputs(p => ({ ...p, [ex.id]: { ...p[ex.id], weightKg: e.target.value } }))}
                          style={{ padding: "8px 12px", height: 40, fontSize: 16, width: 100 }}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          placeholder="0" 
                          value={setInputs[ex.id]?.reps || ""}
                          onChange={(e) => setSetInputs(p => ({ ...p, [ex.id]: { ...p[ex.id], reps: e.target.value } }))}
                          style={{ padding: "8px 12px", height: 40, fontSize: 16, width: 80 }}
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: "0", height: 40, width: 40, minWidth: "auto", display: "flex", justifyContent: "center", alignItems: "center" }}
                          onClick={() => handleLogSet(ex.id)}
                        >
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}

          {activeSession && activeSession.exercises.length > 0 && (
            <div style={{ marginTop: 24, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
              <button 
                className="btn btn-primary" 
                style={{ width: "100%", padding: 18, fontSize: 16, fontWeight: 700 }}
                onClick={handleFinishSession}
                disabled={finishing}
              >
                {finishing ? "FINALIZANDO..." : "✔ FINALIZAR & SALVAR SESSÃO"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
