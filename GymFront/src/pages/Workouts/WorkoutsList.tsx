import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  fetchAllWorkouts, 
  createWorkout, 
  deleteWorkout, 
  fetchWorkoutById, 
  addWorkoutExercise, 
  removeWorkoutExercise,
  updateExerciseNote,
  reorderExercises,
  startFromTemplate
} from "../../api/workoutApi";
import { fetchAllExercises } from "../../api/exerciseApi";
import { usePreferences } from "../../context/PreferencesContext";
import type { WorkoutSummary, WorkoutResponse } from "../../types/workout";
import type { Exercise } from "../../types/exercise";

export default function WorkoutsList() {
  const navigate = useNavigate();
  const { t } = usePreferences();
  const [history, setHistory] = useState<WorkoutSummary[]>([]);
  const [templates, setTemplates] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  
  // Builder state
  const [templateName, setTemplateName] = useState("");
  const [activeTemplate, setActiveTemplate] = useState<WorkoutResponse | null>(null);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [addingEx, setAddingEx] = useState(false);
  
  // Note edit state (inline)
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
    fetchAllExercises().then(list => {
      setAvailableExercises(list);
      if (list.length > 0) setSelectedExerciseId(list[0].id);
    }).catch(console.error);
  }, []);

  const loadData = async () => {
    try {
      const [hist, temps] = await Promise.all([
        fetchAllWorkouts(false),
        fetchAllWorkouts(true)
      ]);
      setHistory(hist);
      setTemplates(temps);
    } catch (e) {
      setError("Failed to load workouts.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTemplateId(null);
    setTemplateName("");
    setActiveTemplate(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (id: string, name: string) => {
    setEditingTemplateId(id);
    setTemplateName(name);
    setIsModalOpen(true);
    try {
      const data = await fetchWorkoutById(id);
      setActiveTemplate(data);
      const notes: Record<string, string> = {};
      data.exercises.forEach(ex => {
        notes[ex.id] = ex.notes || "";
      });
      setNoteInputs(notes);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) return;
    try {
      const { id } = await createWorkout(templateName.trim(), true);
      setEditingTemplateId(id);
      const data = await fetchWorkoutById(id);
      setActiveTemplate(data);
      loadData();
    } catch (e) {
      alert("Failed to create template");
    }
  };

  const handleAddExercise = async () => {
    if (!editingTemplateId || !selectedExerciseId) return;
    setAddingEx(true);
    try {
      await addWorkoutExercise(editingTemplateId, selectedExerciseId, "NO_TECHNIQUE", null);
      const data = await fetchWorkoutById(editingTemplateId);
      setActiveTemplate(data);
      loadData(); // Update template count in background
    } catch {
      alert("Erro ao adicionar exercício.");
    } finally {
      setAddingEx(false);
    }
  };

  const handleMove = async (idx: number, dir: number) => {
    if (!activeTemplate || !editingTemplateId) return;
    const ids = activeTemplate.exercises.map(e => e.id);
    const target = idx + dir;
    if (target < 0 || target >= ids.length) return;
    const next = [...ids];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    setActiveTemplate({ ...activeTemplate, exercises: next.map(id => activeTemplate.exercises.find(e => e.id === id)!) } as WorkoutResponse);
    try {
      await reorderExercises(editingTemplateId, next);
      const data = await fetchWorkoutById(editingTemplateId);
      setActiveTemplate(data);
    } catch {
      alert("Failed to reorder");
    }
  };

  const handleRemoveExercise = async (workoutExerciseId: string) => {
    if (!editingTemplateId) return;
    try {
      await removeWorkoutExercise(editingTemplateId, workoutExerciseId);
      const data = await fetchWorkoutById(editingTemplateId);
      setActiveTemplate(data);
      loadData();
    } catch {
      alert("Erro ao remover exercício.");
    }
  };

  const handleSaveNote = async (workoutExerciseId: string) => {
    if (!editingTemplateId) return;
    try {
      await updateExerciseNote(editingTemplateId, workoutExerciseId, noteInputs[workoutExerciseId]);
    } catch {
      alert("Erro ao salvar orientação.");
    }
  };

  const handleStartSession = async (templateId: string) => {
    try {
      const res = await startFromTemplate(templateId);
      navigate(`/workouts/log?sessionId=${res.id}`);
    } catch {
      alert("Failed to start session.");
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await deleteWorkout(id);
      if (editingTemplateId === id) setIsModalOpen(false);
      loadData();
    } catch {
      alert("Erro ao excluir.");
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48, marginTop: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.03em" }}>{t("workouts")}</h1>
          <div style={{ width: 40, height: 4, background: "var(--accent)", marginTop: 8 }}></div>
        </div>
        <button 
          onClick={openCreateModal}
          className="btn btn-primary"
        >
          + {t("createTemplate")}
        </button>
      </div>

      {loading && <div style={{ color: "var(--muted)", margin: "40px 0", fontFamily: "monospace" }}>[ LOADING SYSTEM... ]</div>}
      {error && <div style={{ color: "var(--pink)", margin: "40px 0", fontFamily: "monospace" }}>[ ERR: {error} ]</div>}

      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
          
          {/* TEMPLATES LIST */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: "var(--accent)" }}></div>
              <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", margin: 0, fontWeight: 700 }}>{t("templates")}</h2>
            </div>
            
            {templates.length === 0 ? (
              <p style={{ color: "var(--muted)", fontFamily: "monospace" }}>[ NO TEMPLATES CONFIGURED ]</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {templates.map((w) => (
                  <div key={w.id} style={{ 
                    background: "var(--card)",
                    border: "1px solid var(--border)", 
                    borderRadius: 4, 
                    padding: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: "var(--ink)", letterSpacing: "0.02em" }}>{w.name}</div>
                      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, fontFamily: "monospace" }}>{w.exerciseCount} MODULES</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button 
                        onClick={() => openEditModal(w.id, w.name)}
                        className="btn btn-outline btn-sm"
                      >
                        {t("edit")}
                      </button>
                      <button 
                        onClick={() => handleStartSession(w.id)}
                        className="btn btn-sm"
                        style={{ background: "var(--accent-glow)", border: "1px solid var(--accent)", color: "var(--accent)" }}
                      >
                        {t("start")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HISTORY LIST */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: "var(--faint)" }}></div>
              <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", margin: 0, fontWeight: 700 }}>{t("logArchive")}</h2>
            </div>
            
            {history.length === 0 ? (
              <p style={{ color: "var(--muted)", fontFamily: "monospace" }}>[ ARCHIVE EMPTY ]</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map((w) => (
                  <div key={w.id} onClick={() => navigate(`/workouts/${w.id}`)} style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    padding: "16px 0", 
                    borderBottom: "1px solid var(--border)",
                    cursor: "pointer"
                  }}>
                    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                      <span style={{ color: "var(--muted)", fontFamily: "monospace", fontSize: 13, minWidth: 100 }}>
                        {new Date(w.createdAt).toLocaleDateString()}
                      </span>
                      <span style={{ fontWeight: 600, color: "var(--ink)" }}>{w.name}</span>
                    </div>
                    <span style={{ color: "var(--muted)", fontFamily: "monospace", fontSize: 13 }}>
                      {w.exerciseCount} EXS
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TEMPLATE BUILDER MODAL */}
      {isModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", zIndex: 999,
          display: "flex", justifyContent: "center", alignItems: "center", padding: 24
        }}>
          <div style={{ width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 32, position: "relative", boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}>
            <button 
              onClick={() => setIsModalOpen(false)} 
              style={{ position: "absolute", top: 24, right: 24, background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--muted)" }}
            >
              ✕
            </button>
            
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32, color: "var(--ink)", textTransform: "uppercase" }}>
              {editingTemplateId ? t("editTemplate") : t("newTemplate")}
            </h2>

            {!editingTemplateId ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("designation")}</label>
                <div style={{ display: "flex", gap: 12 }}>
                  <input 
                    value={templateName} 
                    onChange={(e) => setTemplateName(e.target.value)} 
                    placeholder="e.g. Upper - Push Day" 
                    style={{ flex: 1, background: "var(--faint)", border: "1px solid var(--border)", color: "var(--ink)", padding: "12px 16px", borderRadius: 4, fontSize: 16 }}
                  />
                  <button 
                    onClick={handleCreateTemplate}
                    style={{ background: "var(--accent)", color: "var(--bg)", border: "none", padding: "0 24px", borderRadius: 4, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}
                  >
                    {t("create")}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("designation")}</label>
                  <input value={templateName} disabled style={{ background: "transparent", border: "none", borderBottom: "1px solid var(--border)", color: "var(--ink)", padding: "12px 0", borderRadius: 0, fontSize: 18, fontWeight: 700 }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("appendModule")}</label>
                  <div style={{ display: "flex", gap: 12 }}>
                    <select 
                      value={selectedExerciseId} 
                      onChange={(e) => setSelectedExerciseId(e.target.value)}
                      style={{ flex: 1, background: "var(--faint)", border: "1px solid var(--border)", color: "var(--ink)", padding: "12px 16px", borderRadius: 4, fontSize: 14 }}
                    >
                      <option value="">-- SELECT FROM DATABASE --</option>
                      {availableExercises.map((e) => (
                        <option key={e.id} value={e.id}>{e.name} ({e.muscleGroup})</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleAddExercise}
                      disabled={addingEx || !selectedExerciseId}
                      className="btn btn-outline"
                    >
                      {addingEx ? "..." : t("add")}
                    </button>
                  </div>
                </div>

                {activeTemplate && activeTemplate.exercises.length > 0 && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16, display: "block" }}>
                      {t("loadoutSequence")} 
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {activeTemplate.exercises.map((ex, i) => (
                        <div key={ex.id} style={{ border: "1px solid var(--border)", borderRadius: 4, padding: 16, background: "var(--card)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>{String(i + 1).padStart(2, '0')} - {ex.exerciseName}</span>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <button onClick={() => handleMove(i, -1)} disabled={i === 0} style={{ background: "var(--faint)", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 4, width: 28, height: 28, cursor: i === 0 ? "not-allowed" : "pointer", opacity: i === 0 ? 0.4 : 1 }}>▲</button>
                              <button onClick={() => handleMove(i, 1)} disabled={i === activeTemplate.exercises.length - 1} style={{ background: "var(--faint)", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 4, width: 28, height: 28, cursor: i === activeTemplate.exercises.length - 1 ? "not-allowed" : "pointer", opacity: i === activeTemplate.exercises.length - 1 ? 0.4 : 1 }}>▼</button>
                              <button onClick={() => handleRemoveExercise(ex.id)} style={{ background: "transparent", border: "none", color: "var(--pink)", cursor: "pointer", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>[ REMOVE ]</button>
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{t("notesOrientations")}</label>
                            <input 
                              placeholder="-- EMPTY --"
                              value={noteInputs[ex.id] || ""}
                              onChange={(e) => setNoteInputs(p => ({ ...p, [ex.id]: e.target.value }))}
                              onBlur={() => handleSaveNote(ex.id)}
                              style={{ background: "transparent", border: "none", borderBottom: "1px dashed var(--border)", color: "var(--muted)", padding: "8px 0", borderRadius: 0, fontSize: 13 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 48, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 24 }}>
                  <button 
                    onClick={() => handleDeleteTemplate(editingTemplateId)}
                    style={{ background: "transparent", border: "none", color: "var(--pink)", cursor: "pointer", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}
                  >
                    {t("deleteTemplate")}
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    style={{ background: "var(--ink)", color: "var(--bg)", border: "none", padding: "12px 32px", borderRadius: 4, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}
                  >
                    {t("save")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
