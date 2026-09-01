import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  fetchAllWorkouts, 
  createWorkout, 
  deleteWorkout, 
  fetchWorkoutById, 
  addWorkoutExercise, 
  removeWorkoutExercise,
  updateExerciseNote
} from "../../api/workoutApi";
import { fetchAllExercises } from "../../api/exerciseApi";
import type { WorkoutSummary, WorkoutResponse } from "../../types/workout";
import type { Exercise } from "../../types/exercise";

export default function WorkoutsList() {
  const navigate = useNavigate();
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
      <div className="page-head">
        <div>
          <h1 className="page-title">Workouts</h1>
          <p className="page-sub">Seus templates e histórico de sessões</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Criar Template
        </button>
      </div>

      {loading && <div style={{ color: "var(--muted)", margin: "40px 0" }}>Loading...</div>}
      {error && <div style={{ color: "var(--pink)", margin: "40px 0" }}>{error}</div>}

      {!loading && !error && (
        <div className="grid g-main-side" style={{ alignItems: "start" }}>
          
          {/* TEMPLATES LIST */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Templates Salvos</div>
            </div>
            {templates.length === 0 ? (
              <p style={{ color: "var(--muted)", marginTop: 12 }}>Nenhum template salvo.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                {templates.map((w) => (
                  <div key={w.id} style={{ 
                    border: "1px solid var(--border)", 
                    borderRadius: 8, 
                    padding: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{w.name}</div>
                      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{w.exerciseCount} exercícios</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEditModal(w.id, w.name)}>Editar</button>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/workouts/log?templateId=${w.id}`)}>▶ Iniciar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HISTORY LIST */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Histórico de Sessões</div>
            </div>
            {history.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>Nenhuma sessão registrada.</p>
            ) : (
              <table>
                <tbody>
                  {history.map((w) => (
                    <tr key={w.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/workouts/${w.id}`)}>
                      <td style={{ color: "var(--muted)", width: 100 }}>
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ fontWeight: 600 }}>{w.name}</td>
                      <td style={{ textAlign: "right", color: "var(--muted)" }}>{w.exerciseCount} exs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TEMPLATE BUILDER MODAL */}
      {isModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 999,
          display: "flex", justifyContent: "center", alignItems: "center", padding: 24
        }}>
          <div className="card" style={{ width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <button 
              onClick={() => setIsModalOpen(false)} 
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)" }}
            >
              ✕
            </button>
            
            <h2 style={{ fontSize: 20, marginBottom: 24 }}>
              {editingTemplateId ? "Editar Template" : "Criar Novo Template"}
            </h2>

            {!editingTemplateId ? (
              <div className="field">
                <label>Nome do Template</label>
                <div className="field-row">
                  <input 
                    value={templateName} 
                    onChange={(e) => setTemplateName(e.target.value)} 
                    placeholder="Ex: Upper A" 
                  />
                  <button className="btn btn-primary" onClick={handleCreateTemplate}>Criar & Continuar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="field">
                  <label>Nome do Template</label>
                  <input value={templateName} disabled style={{ background: "var(--bg)" }} />
                </div>

                <div className="field" style={{ marginTop: 24 }}>
                  <label>Adicionar Exercício</label>
                  <div className="field-row">
                    <select value={selectedExerciseId} onChange={(e) => setSelectedExerciseId(e.target.value)}>
                      <option value="">Selecione...</option>
                      {availableExercises.map((e) => (
                        <option key={e.id} value={e.id}>{e.name} ({e.muscleGroup})</option>
                      ))}
                    </select>
                    <button 
                      className="btn btn-outline" 
                      onClick={handleAddExercise}
                      disabled={addingEx || !selectedExerciseId}
                    >
                      {addingEx ? "..." : "+ Adicionar"}
                    </button>
                  </div>
                </div>

                {activeTemplate && activeTemplate.exercises.length > 0 && (
                  <div style={{ marginTop: 32 }}>
                    <h3 style={{ fontSize: 15, marginBottom: 12 }}>Exercícios no Template:</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {activeTemplate.exercises.map((ex, i) => (
                        <div key={ex.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <span style={{ fontWeight: 600 }}>{i + 1}. {ex.exerciseName}</span>
                            <button 
                              className="btn btn-ghost btn-sm" 
                              style={{ color: "var(--pink)" }}
                              onClick={() => handleRemoveExercise(ex.id)}
                            >
                              Remover
                            </button>
                          </div>
                          <div className="field" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: 12 }}>Orientações / Notas de Execução (Opcional)</label>
                            <input 
                              placeholder="Ex: Fazer back-off set na última série"
                              value={noteInputs[ex.id] || ""}
                              onChange={(e) => setNoteInputs(p => ({ ...p, [ex.id]: e.target.value }))}
                              onBlur={() => handleSaveNote(ex.id)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between" }}>
                  <button className="btn btn-ghost" style={{ color: "var(--pink)" }} onClick={() => handleDeleteTemplate(editingTemplateId)}>
                    Excluir Template
                  </button>
                  <button className="btn btn-primary" onClick={() => setIsModalOpen(false)}>
                    Concluir Edição
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
