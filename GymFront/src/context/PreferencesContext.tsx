import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export type ThemeMode = "dark" | "light";
export type Lang = "en" | "pt";

interface PreferencesContextType {
  theme: ThemeMode;
  lang: Lang;
  setTheme: (t: ThemeMode) => void;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  translateMuscle: (muscle: string) => string;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

type Dict = Record<string, string>;

const MUSCLE_TRANSLATIONS: Record<string, string> = {
  chest: "Peito",
  back: "Costas",
  legs: "Pernas",
  shoulders: "Ombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  core: "Abdômen",
  "full body": "Corpo inteiro",
  "lower 1": "Inferior 1",
  "lower 2": "Inferior 2",
  chest_triceps: "Peito e Tríceps",
};

const DICT: Record<Lang, Dict> = {
  en: {
    dashboard: "Dashboard",
    workouts: "Workouts",
    exercises: "Exercises",
    progress: "Progress",
    overview: "Overview",
    goals: "Goals",
    settings: "Settings",
    search: "Search...",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    logout: "Log out",
    language: "Language",
    theme: "Theme",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    profile: "Profile",
    name: "Name",
    email: "Email",
    avgLoad: "Average Load",
    totalLoadHint: "Enter the total load used (e.g. plates + bar)",
    cancelSession: "Cancel session",
    discardSession: "Discard session?",
    discardMsg: "Logged sets will be deleted and this session will not count toward your stats.",
    keep: "Keep",
    discard: "Discard",
    finishSession: "Save session",
    orientation: "Orientation",
    sessionNote: "Session note",
    newWorkout: "New workout",
    start: "Start",
    edit: "Edit",
    remove: "Remove",
    templates: "Templates",
    logArchive: "Log Archive",
    createTemplate: "Create template",
    newTemplate: "New Template",
    editTemplate: "Edit Template",
    designation: "Designation",
    appendModule: "Add Exercise",
    loadoutSequence: "Exercises",
    notesOrientations: "Notes / Orientations",
    deleteTemplate: "Delete Template",
    commit: "Save",
    initialize: "Create",
    add: "Add",
    selectExercise: "Select exercise",
    target: "Target",
    detail: "Detail",
    enterTotalLoad: "Enter the total load used (e.g. plates + bar)",
    workouts30d: "30-day Workouts",
    totalSets30d: "Total Sets (30d)",
    averageLoadKg: "Average Load (kg)",
    overallProgress: "Overall Progress",
    volumePerMuscle: "7-day Volume per Muscle",
    sets: "Sets",
    progression: "Progression",
    topPriorityExercises: "Top Priority Exercises",
    recentLogs: "Recent Logs",
    noData: "No data",
    latest: "Latest",
    bestSet: "Best Set",
    estimated1rm: "Estimated 1RM",
    sessionHistory: "Session History",
    totalReps: "Total Reps",
    muscleGroup: "Muscle Group",
    addExercise: "Add exercise",
    targetObjectives: "Target Objectives",
    activeTargets: "Active Targets",
    newTarget: "New Target",
    noGoals: "No goals yet",
    goalReached: "Goal reached",
    completed: "Completed",
    inProgress: "In progress",
    noNotifications: "No notifications",
    noTemplates: "No templates",
    noResults: "No results",
    volumeWeekly: "Weekly Set Volume",
    exerciseProgress: "Exercise Progress (e1rm)",
    allMuscles: "All muscles",
    template: "Template",
    newEntry: "New Exercise",
    targetMuscles: "Target muscles",
    weeklyVolume: "Weekly volume",
    select: "Select",
    confirm: "Confirm",
    details: "Details",
    created: "Created",
    deadline: "Deadline",
    none: "None",
    deleteGoal: "Delete Goal",
  },
  pt: {
    dashboard: "Dashboard",
    workouts: "Treinos",
    exercises: "Exercícios",
    progress: "Progresso",
    overview: "Geral",
    goals: "Metas",
    settings: "Configurações",
    search: "Pesquisar...",
    save: "Salvar",
    saving: "Salvando...",
    cancel: "Cancelar",
    logout: "Sair",
    language: "Idioma",
    theme: "Tema",
    darkMode: "Modo escuro",
    lightMode: "Modo claro",
    profile: "Perfil",
    name: "Nome",
    email: "E-mail",
    avgLoad: "Carga Média",
    totalLoadHint: "Insira a carga total usada (ex: placas + barra)",
    cancelSession: "Cancelar sessão",
    discardSession: "Descartar sessão?",
    discardMsg: "As séries registradas serão apagadas e esta sessão não contará para suas estatísticas.",
    keep: "Manter",
    discard: "Descartar",
    finishSession: "Salvar sessão",
    orientation: "Orientação",
    sessionNote: "Nota da sessão",
    newWorkout: "Novo treino",
    start: "Iniciar",
    edit: "Editar",
    remove: "Remover",
    templates: "Modelos",
    logArchive: "Histórico",
    createTemplate: "Criar modelo",
    newTemplate: "Novo modelo",
    editTemplate: "Editar modelo",
    designation: "Nome",
    appendModule: "Adicionar exercício",
    loadoutSequence: "Exercícios",
    notesOrientations: "Notas / Orientações",
    deleteTemplate: "Excluir modelo",
    commit: "Salvar",
    initialize: "Criar",
    add: "Adicionar",
    selectExercise: "Selecionar exercício",
    target: "Metas",
    detail: "Detalhe",
    enterTotalLoad: "Insira a carga total usada (ex: placas + barra)",
    workouts30d: "Treinos em 30 dias",
    totalSets30d: "Total de séries (30d)",
    averageLoadKg: "Carga média (kg)",
    overallProgress: "Progresso geral",
    volumePerMuscle: "Volume semanal por músculo",
    sets: "Séries",
    progression: "Progressão",
    topPriorityExercises: "Exercícios prioritários",
    recentLogs: "Registros recentes",
    noData: "Sem dados",
    latest: "Mais recente",
    bestSet: "Melhor série",
    estimated1rm: "1RM Estimado",
    sessionHistory: "Histórico de sessões",
    totalReps: "Reps total",
    muscleGroup: "Grupo muscular",
    addExercise: "Adicionar exercício",
    targetObjectives: "Objetivos",
    activeTargets: "Metas ativas",
    newTarget: "Nova meta",
    noGoals: "Nenhuma meta ainda",
    goalReached: "Meta alcançada",
    completed: "Concluído",
    inProgress: "Em andamento",
    noNotifications: "Sem notificações",
    noTemplates: "Nenhum modelo",
    noResults: "Sem resultados",
    volumeWeekly: "Volume semanal",
    exerciseProgress: "Progresso dos exercícios (e1rm)",
    allMuscles: "Todos os músculos",
    template: "Modelo",
    newEntry: "Novo exercício",
    targetMuscles: "Músculos alvo",
    weeklyVolume: "Volume semanal",
    select: "Selecionar",
    confirm: "Confirmar",
    details: "Detalhes",
    created: "Criado",
    deadline: "Prazo",
    none: "Nenhum",
    deleteGoal: "Excluir meta",
  },
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("kfit_theme");
    return saved === "light" ? "light" : "dark";
  });
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("kfit_lang");
    return saved === "pt" ? "pt" : "en";
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", theme === "dark" ? "scoreboard" : "light");
    localStorage.setItem("kfit_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("kfit_lang", lang);
  }, [lang]);

  const setTheme = (t: ThemeMode) => setThemeState(t);
  const setLang = (l: Lang) => setLangState(l);
  const dict = DICT[lang];

  const t = (key: string, vars?: Record<string, string | number>) => {
    let str = dict[key] ?? DICT.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  };

  const translateMuscle = (muscle: string): string => {
    if (lang === "en") return muscle;
    const key = muscle.trim().toLowerCase();
    return MUSCLE_TRANSLATIONS[key] ?? muscle;
  };

  return (
    <PreferencesContext.Provider value={{ theme, lang, setTheme, setLang, t, translateMuscle }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}
