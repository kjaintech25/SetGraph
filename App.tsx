import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Dumbbell, 
  History, 
  BarChart2, 
  Settings as SettingsIcon, 
  Plus, 
  X, 
  CheckCircle2, 
  ChevronRight, 
  Zap,
  Trash2,
  Clock,
  Play,
  Copy,
  Timer,
  Trophy,
  Save,
  Layout,
  Sun,
  Moon,
  Scale,
  PlusCircle,
  Check,
  RotateCcw,
  Repeat,
  List,
  Calendar,
  User,
  ChevronDown,
  Minus
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Exercise, 
  WorkoutSession, 
  LoggedExercise, 
  WorkoutSet, 
  WorkoutTemplate,
  MuscleGroup
} from './types';
import { EXERCISE_LIBRARY, ACCENT_COLORS } from './constants';

// --- Utility ---
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

// --- Nav Item ---
const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  accent: string;
  onClick: () => void 
}> = ({ icon, label, active, accent, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-0.5 py-2 px-3 transition-all ${active ? `text-${accent}-500` : 'text-zinc-500'}`}
  >
    {icon}
    <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
  </button>
);

// --- Compact Set Row ---
const SetRow: React.FC<{ 
  set: WorkoutSet; 
  index: number; 
  units: 'kg' | 'lb';
  prevSet?: WorkoutSet;
  isLast: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, weight: number, reps: number, rpe: number) => void;
  onRepeat: (set: WorkoutSet) => void;
  onAddSet: () => void;
}> = ({ set, index, units, prevSet, isLast, onDelete, onUpdate, onRepeat, onAddSet }) => {
  const weightDiff = prevSet ? set.weight - prevSet.weight : null;
  const repsDiff = prevSet ? set.reps - prevSet.reps : null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && set.weight > 0 && set.reps > 0) {
      onAddSet();
    }
  };

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 group">
      <span className="text-xs text-zinc-500 w-5 font-medium">{index + 1}</span>
      
      <div className="flex-1 flex items-center gap-1.5">
        <input 
          type="number" 
          className="w-16 bg-zinc-800 rounded-lg px-2 py-1.5 text-center text-sm font-semibold text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500/50 border-0"
          value={set.weight || ''} 
          placeholder="0"
          onChange={(e) => onUpdate(set.id, parseFloat(e.target.value) || 0, set.reps, set.rpe)}
          onKeyDown={handleKeyDown}
        />
        <span className="text-[10px] text-zinc-600 w-4">{units}</span>
        
        <span className="text-zinc-700 mx-0.5">×</span>
        
        <input 
          type="number" 
          className="w-14 bg-zinc-800 rounded-lg px-2 py-1.5 text-center text-sm font-semibold text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500/50 border-0"
          value={set.reps || ''} 
          placeholder="0"
          onChange={(e) => onUpdate(set.id, set.weight, parseInt(e.target.value) || 0, set.rpe)}
          onKeyDown={handleKeyDown}
        />
        
        {set.isPB && <Trophy size={12} className="text-yellow-500 ml-1" />}
        
        {(weightDiff !== null || repsDiff !== null) && set.weight > 0 && set.reps > 0 && (
          <span className={`text-[10px] ml-1 font-medium ${weightDiff && weightDiff > 0 ? 'text-emerald-400' : weightDiff && weightDiff < 0 ? 'text-red-400' : 'text-zinc-600'}`}>
            {weightDiff && weightDiff > 0 ? '+' : ''}{weightDiff}{units} {repsDiff && repsDiff > 0 ? '+' : ''}{repsDiff}r
          </span>
        )}

        {isLast && set.weight > 0 && set.reps > 0 && (
          <button 
            onClick={onAddSet}
            className="ml-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-semibold hover:bg-emerald-500/30 transition-all"
          >
            +Set
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onRepeat(set)}
          className="p-1 text-zinc-600 hover:text-emerald-400 transition-colors"
          title="Repeat set"
        >
          <Repeat size={14} />
        </button>
        <button 
          onClick={() => onDelete(set.id)}
          className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// --- Settings Modal ---
const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  settings: { theme: 'light' | 'dark', units: 'kg' | 'lb', accent: string, restDuration: number };
  onUpdate: (key: string, value: any) => void;
}> = ({ isOpen, onClose, settings, onUpdate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center">
      <div className="bg-zinc-900 w-full max-w-md rounded-t-3xl p-5 pb-8 space-y-5 animate-in slide-in-from-bottom duration-300 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-zinc-100">Settings</h2>
          <button onClick={onClose} className="p-1.5 bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-100 transition-colors">
            <X size={16}/>
          </button>
        </div>

        <div className="space-y-4">
          {/* Theme */}
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
            <div className="flex items-center gap-2">
              {settings.theme === 'dark' ? <Moon size={16} className="text-blue-400"/> : <Sun size={16} className="text-amber-500"/>}
              <span className="text-sm font-medium text-zinc-200">Theme</span>
            </div>
            <button 
              onClick={() => onUpdate('theme', settings.theme === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1 bg-zinc-700 rounded-lg text-xs font-semibold text-zinc-300 capitalize"
            >
              {settings.theme}
            </button>
          </div>

          {/* Units */}
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-zinc-400"/>
              <span className="text-sm font-medium text-zinc-200">Units</span>
            </div>
            <button 
              onClick={() => onUpdate('units', settings.units === 'kg' ? 'lb' : 'kg')}
              className="px-3 py-1 bg-zinc-700 rounded-lg text-xs font-semibold text-zinc-300 uppercase"
            >
              {settings.units}
            </button>
          </div>

          {/* Rest Timer */}
          <div className="p-3 bg-zinc-800/50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer size={16} className="text-zinc-400"/>
                <span className="text-sm font-medium text-zinc-200">Rest Timer</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">{formatTime(settings.restDuration)}</span>
            </div>
            <input 
              type="range"
              min="15"
              max="300"
              step="15"
              value={settings.restDuration}
              onChange={(e) => onUpdate('restDuration', parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-600">
              <span>0:15</span>
              <span>5:00</span>
            </div>
          </div>

          {/* Accent Color */}
          <div className="p-3 bg-zinc-800/50 rounded-xl space-y-3">
            <span className="text-sm font-medium text-zinc-200">Accent Color</span>
            <div className="flex gap-2">
              {ACCENT_COLORS.map(color => (
                <button
                  key={color.value}
                  onClick={() => onUpdate('accent', color.value)}
                  style={{ backgroundColor: color.hex }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${settings.accent === color.value ? 'ring-2 ring-offset-2 ring-offset-zinc-800 ring-white scale-110' : 'opacity-60 hover:opacity-100'}`}
                >
                  {settings.accent === color.value && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 text-center">
          <p className="text-[10px] text-zinc-600 font-medium">VibeSet v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

// --- Exercise Picker Modal ---
const ExercisePicker: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  accent: string;
  onSelect: (exercise: Exercise) => void;
  onAddCustom: (name: string, muscle: MuscleGroup) => void;
  isBuildingPlan?: boolean;
  planExerciseIds?: string[];
  onTogglePlanExercise?: (exerciseId: string) => void;
  onSavePlan?: () => void;
}> = ({ isOpen, onClose, exercises, accent, onSelect, onAddCustom, isBuildingPlan, planExerciseIds, onTogglePlanExercise, onSavePlan }) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('Chest');

  // Group exercises by muscle — MUST be before any conditional returns (React rules)
  const grouped = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};
    exercises.forEach(ex => {
      if (!groups[ex.muscleGroup]) groups[ex.muscleGroup] = [];
      groups[ex.muscleGroup].push(ex);
    });
    return groups;
  }, [exercises]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
      <div className="bg-zinc-900 w-full max-w-md rounded-t-3xl h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-zinc-100">{isBuildingPlan ? 'Build Plan' : 'Exercises'}</h3>
            {isBuildingPlan && planExerciseIds && (
              <span className="text-[10px] text-zinc-500">{planExerciseIds.length} selected</span>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowCustom(!showCustom)}
              className={`p-2 rounded-xl transition-all ${showCustom ? `bg-${accent}-500/20 text-${accent}-400` : 'bg-zinc-800 text-zinc-400'}`}
            >
              <PlusCircle size={18} />
            </button>
            <button onClick={onClose} className="p-2 bg-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-100 transition-colors">
              <X size={18}/>
            </button>
          </div>
        </div>

        {showCustom && (
          <div className="p-3 border-b border-zinc-800 bg-zinc-800/30">
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-zinc-800 px-3 py-2 rounded-xl text-sm text-zinc-100 outline-none placeholder-zinc-500"
                placeholder="Exercise name..."
                value={customName}
                onChange={e => setCustomName(e.target.value)}
              />
              <select 
                className="bg-zinc-800 px-3 py-2 rounded-xl text-sm text-zinc-300 outline-none"
                value={customMuscle}
                onChange={e => setCustomMuscle(e.target.value as MuscleGroup)}
              >
                {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <button 
                disabled={!customName.trim()}
                onClick={() => {
                  onAddCustom(customName, customMuscle);
                  setCustomName('');
                  setShowCustom(false);
                }}
                className={`px-3 py-2 bg-${accent}-500 text-white rounded-xl text-sm font-semibold disabled:opacity-40`}
              >
                Add
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {Object.entries(grouped).map(([muscle, exs]) => (
            <div key={muscle}>
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 mb-1.5">{muscle} ({exs.length})</h4>
              <div className="space-y-0.5">
                {exs.map(ex => (
                  <button 
                    key={ex.id}
                    onClick={() => {
                      if (isBuildingPlan) {
                        onTogglePlanExercise?.(ex.id);
                      } else {
                        onSelect(ex);
                        onClose();
                      }
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-between group"
                  >
                    <span className="text-sm text-zinc-200 group-hover:text-zinc-100">{ex.name}</span>
                    {isBuildingPlan ? (
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${planExerciseIds?.includes(ex.id) ? `bg-${accent}-500 border-${accent}-500` : 'border-zinc-600'}`}>
                        {planExerciseIds?.includes(ex.id) && <Check size={12} className="text-white" />}
                      </div>
                    ) : (
                      <Plus size={16} className="text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
const App: React.FC = () => {
  type TabType = 'sets' | 'sessions' | 'body' | 'today';
  const [activeTab, setActiveTab] = useState<TabType>('sets');
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>(EXERCISE_LIBRARY);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<string | null>(null);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [isBuildingPlan, setIsBuildingPlan] = useState(false);
  const [planExerciseIds, setPlanExerciseIds] = useState<string[]>([]);

  const [settings, setSettings] = useState({
    theme: 'dark' as 'light' | 'dark',
    units: 'kg' as 'kg' | 'lb',
    accent: 'emerald',
    restDuration: 60
  });

  const [exerciseTimer, setExerciseTimer] = useState<number | null>(null);
  const [workoutStopwatch, setWorkoutStopwatch] = useState<number>(0);

  const timerRef = useRef<any>(null);
  const stopwatchRef = useRef<any>(null);

  // Exercise grouping — MUST be at top level (React rules), used by renderBody
  const exerciseGrouped = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};
    exercises.forEach(ex => {
      if (!groups[ex.muscleGroup]) groups[ex.muscleGroup] = [];
      groups[ex.muscleGroup].push(ex);
    });
    return groups;
  }, [exercises]);

  const exerciseGroupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    exercises.forEach(ex => {
      counts[ex.muscleGroup] = (counts[ex.muscleGroup] || 0) + 1;
    });
    return counts;
  }, [exercises]);

  // Persistence
  useEffect(() => {
    const savedSessions = localStorage.getItem('vibeset_sessions');
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    const savedTemplates = localStorage.getItem('vibeset_templates');
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
    const savedSettings = localStorage.getItem('vibeset_settings');
    if (savedSettings) setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    const savedCustomExercises = localStorage.getItem('vibeset_custom_exercises');
    if (savedCustomExercises) setExercises([...EXERCISE_LIBRARY, ...JSON.parse(savedCustomExercises)]);
    const savedCurrentSession = localStorage.getItem('vibeset_current_session');
    if (savedCurrentSession) setCurrentSession(JSON.parse(savedCurrentSession));
  }, []);

  useEffect(() => {
    localStorage.setItem('vibeset_sessions', JSON.stringify(sessions));
  }, [sessions]);
  useEffect(() => {
    localStorage.setItem('vibeset_templates', JSON.stringify(templates));
  }, [templates]);
  useEffect(() => {
    localStorage.setItem('vibeset_settings', JSON.stringify(settings));
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings]);
  useEffect(() => {
    if (currentSession) {
      localStorage.setItem('vibeset_current_session', JSON.stringify(currentSession));
    } else {
      localStorage.removeItem('vibeset_current_session');
    }
  }, [currentSession]);

  // Timer
  useEffect(() => {
    if (exerciseTimer !== null && exerciseTimer > 0) {
      timerRef.current = setTimeout(() => setExerciseTimer(exerciseTimer - 1), 1000);
    } else if (exerciseTimer === 0) {
      setExerciseTimer(null);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [exerciseTimer]);

  // Stopwatch
  useEffect(() => {
    if (currentSession && !currentSession.endTime) {
      stopwatchRef.current = setInterval(() => setWorkoutStopwatch(prev => prev + 1), 1000);
    } else {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    }
    return () => { if (stopwatchRef.current) clearInterval(stopwatchRef.current); };
  }, [currentSession]);

  // --- Actions ---
  const startWorkout = (template?: WorkoutTemplate) => {
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      name: template ? template.name : 'Workout',
      startTime: new Date().toISOString(),
      exercises: template ? template.exerciseIds.map(eid => ({
        exerciseId: eid,
        sets: [{ id: Math.random().toString(), weight: 0, reps: 0, rpe: 8, completedAt: new Date().toISOString() }]
      })) : []
    };
    setCurrentSession(newSession);
    setWorkoutStopwatch(0);
    setActiveTab('sets');
  };

  const finishWorkout = () => {
    if (currentSession) {
      const completedSession = { ...currentSession, endTime: new Date().toISOString() };
      setSessions([completedSession, ...sessions]);
      setCurrentSession(null);
      setExerciseTimer(null);
      setWorkoutStopwatch(0);
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
    if (!currentSession) return;
    const newLogged: LoggedExercise = {
      exerciseId: exercise.id,
      sets: [{ id: Math.random().toString(), weight: 0, reps: 0, rpe: 8, completedAt: new Date().toISOString() }]
    };
    setCurrentSession({ ...currentSession, exercises: [...currentSession.exercises, newLogged] });
  };

  const addCustomExercise = (name: string, muscle: MuscleGroup) => {
    const newEx: Exercise = { id: `custom-${Date.now()}`, name, muscleGroup: muscle };
    const updatedExercises = [...exercises, newEx];
    setExercises(updatedExercises);
    const customOnly = updatedExercises.filter(ex => ex.id.startsWith('custom-'));
    localStorage.setItem('vibeset_custom_exercises', JSON.stringify(customOnly));
  };

  const triggerTimer = () => setExerciseTimer(settings.restDuration);

  const addSetToExercise = (exerciseId: string, setDefaults?: Partial<WorkoutSet>) => {
    if (!currentSession) return;
    const exerciseLog = currentSession.exercises.find(e => e.exerciseId === exerciseId);
    const lastSet = exerciseLog?.sets.slice(-1)[0];
    const newSet: WorkoutSet = {
      id: Math.random().toString(),
      weight: setDefaults?.weight ?? lastSet?.weight ?? 0,
      reps: setDefaults?.reps ?? lastSet?.reps ?? 0,
      rpe: setDefaults?.rpe ?? lastSet?.rpe ?? 8,
      completedAt: new Date().toISOString()
    };
    setCurrentSession({
      ...currentSession,
      exercises: currentSession.exercises.map(e => 
        e.exerciseId === exerciseId ? { ...e, sets: [...e.sets, newSet] } : e
      )
    });
    triggerTimer();
  };

  const updateSet = (exerciseId: string, setId: string, weight: number, reps: number, rpe: number) => {
    if (!currentSession) return;
    const allMatchingSets = sessions.flatMap(s => s.exercises)
      .filter(ex => ex.exerciseId === exerciseId)
      .flatMap(ex => ex.sets);
    const maxWeight = Math.max(...allMatchingSets.map(s => s.weight), 0);
    const isPB = weight > maxWeight && weight > 0;

    setCurrentSession({
      ...currentSession,
      exercises: currentSession.exercises.map(e => 
        e.exerciseId === exerciseId ? {
          ...e,
          sets: e.sets.map(s => s.id === setId ? { ...s, weight, reps, rpe, isPB } : s)
        } : e
      )
    });
    if (weight > 0 && reps > 0) triggerTimer();
  };

  const deleteSet = (exerciseId: string, setId: string) => {
    if (!currentSession) return;
    setCurrentSession({
      ...currentSession,
      exercises: currentSession.exercises.map(e => 
        e.exerciseId === exerciseId ? { ...e, sets: e.sets.filter(s => s.id !== setId) } : e
      )
    });
  };

  const repeatSet = (exerciseId: string, set: WorkoutSet) => {
    addSetToExercise(exerciseId, { weight: set.weight, reps: set.reps, rpe: set.rpe });
  };

  const getPreviousSets = (exerciseId: string) => {
    for (const session of sessions) {
      const ex = session.exercises.find(e => e.exerciseId === exerciseId);
      if (ex && ex.sets.length > 0) return ex.sets;
    }
    return null;
  };

  const getComparison = (currentSets: WorkoutSet[], previousSets: WorkoutSet[] | null) => {
    if (!previousSets || previousSets.length === 0 || currentSets.length === 0) return null;
    
    const currVolume = currentSets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
    const prevVolume = previousSets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
    const volumeDiff = prevVolume > 0 ? ((currVolume - prevVolume) / prevVolume * 100).toFixed(1) : '0';
    
    const setsDiff = currentSets.length - previousSets.length;
    const repsDiff = currentSets.reduce((a, s) => a + s.reps, 0) - previousSets.reduce((a, s) => a + s.reps, 0);
    
    const currAvgWeight = currVolume / Math.max(currentSets.reduce((a, s) => a + s.reps, 0), 1);
    const prevAvgWeight = prevVolume / Math.max(previousSets.reduce((a, s) => a + s.reps, 0), 1);
    const lbRepDiff = prevAvgWeight > 0 ? ((currAvgWeight - prevAvgWeight) / prevAvgWeight * 100).toFixed(1) : '0';

    return {
      sets: { diff: setsDiff, pct: previousSets.length > 0 ? ((setsDiff / previousSets.length) * 100).toFixed(1) : '0' },
      reps: { diff: repsDiff, pct: previousSets.reduce((a, s) => a + s.reps, 0) > 0 ? ((repsDiff / previousSets.reduce((a, s) => a + s.reps, 0)) * 100).toFixed(1) : '0' },
      volume: { diff: currVolume - prevVolume, pct: volumeDiff },
      lbRep: { diff: currAvgWeight - prevAvgWeight, pct: lbRepDiff }
    };
  };

  const createTemplate = () => {
    if (!currentSession || currentSession.exercises.length === 0) return;
    const name = prompt("Template name:");
    if (!name) return;
    setTemplates([...templates, { id: Date.now().toString(), name, exerciseIds: currentSession.exercises.map(e => e.exerciseId) }]);
  };

  const savePlanAsTemplate = () => {
    if (planExerciseIds.length === 0) return;
    const name = prompt("Plan name:");
    if (!name) return;
    setTemplates([...templates, { id: Date.now().toString(), name, exerciseIds: [...planExerciseIds] }]);
    setPlanExerciseIds([]);
    setIsBuildingPlan(false);
  };

  // --- Renders ---

  // SETS TAB (main workout logging)
  const renderSets = () => {
    if (!currentSession) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-zinc-100">My Workouts</h2>
          </div>
          
          <div className="w-full max-w-xs space-y-2">
            <button 
              onClick={() => startWorkout()}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Plus size={18} />
              New Workout...
            </button>
            
            <button 
              onClick={() => {
                setPlanExerciseIds([]);
                setIsBuildingPlan(true);
                setIsExercisePickerOpen(true);
              }}
              className="w-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
            >
              <Layout size={18} />
              New Custom Plan...
            </button>
            
            {templates.length > 0 && (
              <div className="pt-4 space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider px-1">My Plans</p>
                {templates.map(t => (
                  <div key={t.id} className="flex items-center gap-2">
                    <button 
                      onClick={() => startWorkout(t)}
                      className="flex-1 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 font-medium py-2.5 px-4 rounded-xl flex items-center justify-between transition-all text-sm"
                    >
                      <span>{t.name}</span>
                      <span className="text-[10px] text-zinc-500">{t.exerciseIds.length} ex</span>
                    </button>
                    <button 
                      onClick={() => setTemplates(templates.filter(temp => temp.id !== t.id))}
                      className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Active workout
    return (
      <div className="flex flex-col h-full">
        {/* Compact timer bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 uppercase font-semibold">Rest</span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold font-mono ${exerciseTimer !== null ? 'text-emerald-400' : 'text-zinc-600'}`}>
                  {exerciseTimer !== null ? `${exerciseTimer}s` : '--'}
                </span>
                {exerciseTimer === null ? (
                  <button 
                    onClick={triggerTimer}
                    className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-semibold hover:bg-emerald-500/30 transition-all"
                  >
                    Start
                  </button>
                ) : (
                  <button 
                    onClick={() => setExerciseTimer(null)}
                    className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-semibold hover:bg-red-500/30 transition-all"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 uppercase font-semibold">Time</span>
              <span className="text-lg font-bold font-mono text-zinc-300 tabular-nums">{formatTime(workoutStopwatch)}</span>
            </div>
          </div>
          <button 
            onClick={finishWorkout}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all active:scale-95"
          >
            Finish
          </button>
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto pb-24">
          {currentSession.exercises.length === 0 && (
            <div className="text-center py-16 text-zinc-600">
              <Dumbbell size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No exercises yet</p>
              <p className="text-xs text-zinc-700 mt-1">Tap + to add one</p>
            </div>
          )}

          {currentSession.exercises.map((log) => {
            const exercise = exercises.find(e => e.id === log.exerciseId);
            const prevSets = getPreviousSets(log.exerciseId);
            const comparison = getComparison(log.sets, prevSets);

            return (
              <div key={log.exerciseId} className="border-b border-zinc-800/50">
                {/* Exercise header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-100">{exercise?.name}</h3>
                    <span className="text-[10px] text-zinc-500">{exercise?.muscleGroup}</span>
                  </div>
                  <button 
                    onClick={() => addSetToExercise(log.exerciseId)}
                    className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Comparison to previous */}
                {comparison && (
                  <div className="mx-4 mb-2 p-2 bg-zinc-800/30 rounded-lg">
                    <p className="text-[9px] text-zinc-500 uppercase font-semibold mb-1.5">Compared to Previous</p>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <div className={`text-xs font-bold ${parseInt(comparison.sets.pct) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {parseInt(comparison.sets.pct) >= 0 ? '▲' : '▼'}{Math.abs(comparison.sets.diff)} ({Math.abs(parseFloat(comparison.sets.pct))}%)
                        </div>
                        <div className="text-[9px] text-zinc-600">Sets</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xs font-bold ${parseInt(comparison.reps.pct) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {parseInt(comparison.reps.pct) >= 0 ? '▲' : '▼'}{Math.abs(comparison.reps.diff)} ({Math.abs(parseFloat(comparison.reps.pct))}%)
                        </div>
                        <div className="text-[9px] text-zinc-600">Reps</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xs font-bold ${parseFloat(comparison.volume.pct) >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                          {parseFloat(comparison.volume.pct) >= 0 ? '▲' : '▼'}{Math.abs(comparison.volume.diff)} ({Math.abs(parseFloat(comparison.volume.pct))}%)
                        </div>
                        <div className="text-[9px] text-zinc-600">Volume</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xs font-bold ${parseFloat(comparison.lbRep.pct) >= 0 ? 'text-orange-400' : 'text-red-400'}`}>
                          {parseFloat(comparison.lbRep.pct) >= 0 ? '▲' : '▼'}{Math.abs(parseFloat(comparison.lbRep.pct))}%
                        </div>
                        <div className="text-[9px] text-zinc-600">{settings.units}/rep</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sets */}
                <div className="px-2 pb-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-[9px] text-zinc-600 uppercase font-semibold">
                    <span className="w-5">Set</span>
                    <span className="flex-1">Weight × Reps</span>
                  </div>
                  {log.sets.map((set, idx) => (
                    <SetRow 
                      key={set.id} 
                      set={set} 
                      index={idx} 
                      units={settings.units}
                      prevSet={prevSets?.[idx]}
                      isLast={idx === log.sets.length - 1}
                      onDelete={(id) => deleteSet(log.exerciseId, id)}
                      onUpdate={(id, w, r, rp) => updateSet(log.exerciseId, id, w, r, rp)}
                      onRepeat={(s) => repeatSet(log.exerciseId, s)}
                      onAddSet={() => addSetToExercise(log.exerciseId)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Add exercise button */}
          <div className="p-4">
            <button 
              onClick={() => setIsExercisePickerOpen(true)}
              className="w-full border border-dashed border-zinc-700 rounded-xl py-4 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Plus size={16} />
              Add Exercise
            </button>
          </div>

          {/* Save as template */}
          {currentSession.exercises.length > 0 && (
            <div className="px-4 pb-4">
              <button 
                onClick={createTemplate}
                className="w-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 text-xs font-medium py-2 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Save size={14} />
                Save as Template
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // SESSIONS TAB (history)
  const renderSessions = () => (
    <div className="h-full overflow-y-auto pb-20">
      <div className="p-4">
        <h2 className="text-lg font-bold text-zinc-100 mb-3">Session History</h2>
        
        {sessions.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <History size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No sessions yet</p>
            <p className="text-xs text-zinc-700 mt-1">Complete a workout to see it here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => {
              const totalVolume = s.exercises.reduce((acc, ex) => 
                acc + ex.sets.reduce((setAcc, set) => setAcc + (set.weight * set.reps), 0), 0
              );
              const totalSets = s.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
              const duration = s.endTime 
                ? Math.floor((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000)
                : 0;

              return (
                <div key={s.id} className="bg-zinc-800/30 rounded-xl p-3 group">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm text-zinc-100">{s.name || 'Workout'}</h3>
                      <p className="text-[10px] text-zinc-500">
                        {new Date(s.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {duration > 0 && ` • ${formatDuration(duration)}`}
                      </p>
                    </div>
                    <button 
                      onClick={() => deleteSession(s.id)}
                      className="p-1.5 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="flex gap-3 text-[10px]">
                    <span className="text-zinc-500">{s.exercises.length} exercises</span>
                    <span className="text-zinc-500">{totalSets} sets</span>
                    <span className="text-emerald-400 font-medium">{totalVolume.toLocaleString()} {settings.units}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {s.exercises.slice(0, 4).map(ex => {
                      const info = exercises.find(e => e.id === ex.exerciseId);
                      return (
                        <span key={ex.exerciseId} className="text-[9px] bg-zinc-700/50 text-zinc-400 px-2 py-0.5 rounded-md">
                          {info?.name}
                        </span>
                      );
                    })}
                    {s.exercises.length > 4 && (
                      <span className="text-[9px] text-zinc-600">+{s.exercises.length - 4} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // FUTURE: Body tab (exercise library + analytics) — disabled for now
  const renderBody = () => {
    return (
      <div className="h-full overflow-y-auto pb-20">
        <div className="p-4">
          <h2 className="text-lg font-bold text-zinc-100 mb-1">My Exercises</h2>
          <p className="text-xs text-zinc-500 mb-4">{exercises.length} total exercises</p>
          
          <div className="space-y-1">
            {Object.entries(exerciseGrouped).map(([muscle, exs]) => (
              <button
                key={muscle}
                onClick={() => setSelectedExerciseDetail(selectedExerciseDetail === muscle ? null : muscle)}
                className="w-full bg-zinc-800/30 hover:bg-zinc-800/50 rounded-xl p-3 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-200">{muscle}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">{exerciseGroupCounts[muscle]}</span>
                    <ChevronDown size={14} className={`text-zinc-500 transition-transform ${selectedExerciseDetail === muscle ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                
                {selectedExerciseDetail === muscle && (
                  <div className="mt-2 pt-2 border-t border-zinc-700/50 space-y-1">
                    {exs.map(ex => {
                      // Find last performed
                      const lastSession = sessions.find(s => s.exercises.some(e => e.exerciseId === ex.id));
                      const lastPerformed = lastSession 
                        ? new Date(lastSession.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : null;

                      return (
                        <div key={ex.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-zinc-700/30">
                          <span className="text-sm text-zinc-300">{ex.name}</span>
                          <span className="text-[10px] text-zinc-600">{lastPerformed || 'Never'}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </button>
            ))}
        </div>

        {/* Save Plan button when building */}
        {isBuildingPlan && planExerciseIds && planExerciseIds.length > 0 && (
          <div className="p-3 border-t border-zinc-800 shrink-0">
            <button 
              onClick={onSavePlan}
              className={`w-full bg-${accent}-500 hover:bg-${accent}-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all`}
            >
              <Save size={16} />
              Save Plan ({planExerciseIds.length} exercises)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

  // TODAY TAB (weekly view + expand to calendar)
  const renderToday = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get workout days this month
    const workoutDays = new Set(
      sessions
        .filter(s => {
          const d = new Date(s.startTime);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .map(s => new Date(s.startTime).getDate())
    );

    // Get workout dates for the week (for highlighting)
    const workoutDates = new Set(
      sessions.map(s => new Date(s.startTime).toDateString())
    );

    // Calculate current week (Sun-Sat)
    const dayOfWeek = today.getDay(); // 0=Sun, 6=Sat
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      weekDays.push(d);
    }

    // This week's stats
    const weekSessions = sessions.filter(s => {
      const d = new Date(s.startTime);
      return d >= weekStart && d <= today;
    });
    const weekWorkouts = weekSessions.length;
    const weekSets = weekSessions.reduce((acc, s) => acc + s.exercises.reduce((a, e) => a + e.sets.length, 0), 0);
    const weekVolume = weekSessions.reduce((acc, s) => 
      acc + s.exercises.reduce((a, e) => a + e.sets.reduce((sa, set) => sa + (set.weight * set.reps), 0), 0), 0
    );

    // Today's sessions
    const todaySessions = sessions.filter(s => {
      const d = new Date(s.startTime);
      return d.toDateString() === today.toDateString();
    });

    // Full calendar data
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);
    const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
      <div className="h-full overflow-y-auto pb-20">
        <div className="p-4">
          {/* Header with calendar toggle */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-100">
              {showFullCalendar ? monthName : 'This Week'}
            </h2>
            <button 
              onClick={() => setShowFullCalendar(!showFullCalendar)}
              className={`p-2 rounded-lg transition-all ${showFullCalendar ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'}`}
            >
              <Calendar size={16} />
            </button>
          </div>

          {/* Weekly View (default) */}
          {!showFullCalendar && (
            <>
              {/* Week strip */}
              <div className="bg-zinc-800/30 rounded-xl p-3 mb-4">
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} className="text-[10px] text-zinc-600 font-medium">{d}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {weekDays.map((d, i) => {
                    const isToday = d.toDateString() === today.toDateString();
                    const hasWorkout = workoutDates.has(d.toDateString());
                    return (
                      <div 
                        key={i} 
                        className={`h-9 flex items-center justify-center rounded-full text-xs font-medium ${
                          isToday
                            ? 'bg-emerald-500 text-white'
                            : hasWorkout
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'text-zinc-400'
                        }`}
                      >
                        {d.getDate()}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Today's sessions */}
              {todaySessions.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs text-zinc-500 uppercase font-semibold mb-2">Today</h3>
                  {todaySessions.map(s => {
                    const totalVolume = s.exercises.reduce((acc, ex) => 
                      acc + ex.sets.reduce((setAcc, set) => setAcc + (set.weight * set.reps), 0), 0
                    );
                    const totalSets = s.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
                    const totalReps = s.exercises.reduce((acc, ex) => 
                      acc + ex.sets.reduce((setAcc, set) => setAcc + set.reps, 0), 0
                    );

                    return (
                      <div key={s.id} className="bg-zinc-800/30 rounded-xl p-3 space-y-2 mb-2">
                        <h4 className="font-semibold text-sm text-zinc-100">{s.name}</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center">
                            <div className="text-base font-bold text-red-400">{totalSets}</div>
                            <div className="text-[9px] text-zinc-500 uppercase">Sets</div>
                          </div>
                          <div className="text-center">
                            <div className="text-base font-bold text-emerald-400">{totalReps}</div>
                            <div className="text-[9px] text-zinc-500 uppercase">Reps</div>
                          </div>
                          <div className="text-center">
                            <div className="text-base font-bold text-cyan-400">{totalVolume.toLocaleString()}</div>
                            <div className="text-[9px] text-zinc-500 uppercase">Vol</div>
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          {s.exercises.map(ex => {
                            const info = exercises.find(e => e.id === ex.exerciseId);
                            return (
                              <div key={ex.exerciseId} className="flex items-center justify-between py-1 px-2 rounded-lg bg-zinc-700/20">
                                <span className="text-xs text-zinc-300">{info?.name}</span>
                                <span className="text-[10px] text-zinc-500">{ex.sets.length} sets</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* This week summary */}
              <div className="bg-zinc-800/30 rounded-xl p-3">
                <h3 className="text-xs text-zinc-500 uppercase font-semibold mb-2">This Week</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-xl font-bold text-zinc-100">{weekWorkouts}</div>
                    <div className="text-[9px] text-zinc-500 uppercase">Workouts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-zinc-100">{weekSets}</div>
                    <div className="text-[9px] text-zinc-500 uppercase">Sets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-400">{weekVolume.toLocaleString()}</div>
                    <div className="text-[9px] text-zinc-500 uppercase">Volume</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Full Calendar View (expanded) */}
          {showFullCalendar && (
            <>
              <div className="bg-zinc-800/30 rounded-xl p-3 mb-4">
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} className="text-[10px] text-zinc-600 font-medium">{d}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarDays.map((day, i) => (
                    <div 
                      key={i} 
                      className={`h-9 flex items-center justify-center rounded-full text-xs font-medium ${
                        day === null 
                          ? '' 
                          : day === today.getDate()
                            ? 'bg-emerald-500 text-white'
                            : workoutDays.has(day)
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'text-zinc-400 hover:bg-zinc-700/50'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly summary */}
              <div className="bg-zinc-800/30 rounded-xl p-4">
                <h3 className="text-xs text-zinc-500 uppercase font-semibold mb-3">This Month</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-zinc-100">{workoutDays.size}</div>
                    <div className="text-[10px] text-zinc-500">Workouts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-zinc-100">
                      {sessions
                        .filter(s => {
                          const d = new Date(s.startTime);
                          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                        })
                        .reduce((acc, s) => acc + s.exercises.reduce((a, e) => a + e.sets.length, 0), 0)
                      }
                    </div>
                    <div className="text-[10px] text-zinc-500">Total Sets</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Logo navigation: active workout → go to sets, else → home. If already on sets with workout → go back to My Workouts
  const handleLogoClick = () => {
    if (activeTab === 'sets' && currentSession) {
      // Already viewing workout, go back to My Workouts
      setCurrentSession(null);
    } else if (currentSession) {
      // Has active workout, navigate to it
      setActiveTab('sets');
    } else {
      // No active workout, go home
      setActiveTab('sets');
    }
  };

  return (
    <div className={`flex flex-col h-screen ${settings.theme === 'dark' ? 'bg-zinc-950' : 'bg-white'} text-zinc-100 max-w-md mx-auto relative overflow-hidden font-inter`}>
      {/* Header */}
      <header className={`px-4 py-3 flex items-center justify-between ${settings.theme === 'dark' ? 'bg-zinc-950' : 'bg-white'} border-b border-zinc-800/50 shrink-0`}>
        <button onClick={handleLogoClick} className="flex items-center gap-2 active:opacity-70 transition-opacity">
          <div className={`w-7 h-7 bg-${settings.accent}-500 rounded-lg flex items-center justify-center`}>
            <Zap size={14} className="text-white" fill="currentColor" />
          </div>
          <h1 className="text-base font-bold text-zinc-100 uppercase tracking-tight">Vibe<span className={`text-${settings.accent}-500`}>Set</span></h1>
        </button>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 text-zinc-500 hover:text-zinc-300 bg-zinc-800/50 rounded-lg transition-all"
        >
          <SettingsIcon size={16} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'sets' && renderSets()}
        {activeTab === 'sessions' && renderSessions()}
        {activeTab === 'today' && renderToday()}
      </main>

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onUpdate={(k, v) => setSettings(prev => ({ ...prev, [k]: v }))}
      />

      <ExercisePicker
        isOpen={isExercisePickerOpen}
        onClose={() => {
          setIsExercisePickerOpen(false);
          setIsBuildingPlan(false);
          setPlanExerciseIds([]);
        }}
        exercises={exercises}
        accent={settings.accent}
        onSelect={addExerciseToWorkout}
        onAddCustom={addCustomExercise}
        isBuildingPlan={isBuildingPlan}
        planExerciseIds={planExerciseIds}
        onTogglePlanExercise={(id) => {
          setPlanExerciseIds(prev => 
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
          );
        }}
        onSavePlan={savePlanAsTemplate}
      />

      {/* Bottom Navigation */}
      <nav className={`${settings.theme === 'dark' ? 'bg-zinc-950/95' : 'bg-white/95'} backdrop-blur-xl border-t border-zinc-800/50 flex justify-around items-center py-1 shrink-0`}>
        <NavItem 
          icon={<List size={20} />} 
          label="Sets" 
          active={activeTab === 'sets'} 
          accent={settings.accent} 
          onClick={() => setActiveTab('sets')} 
        />
        <NavItem 
          icon={<History size={20} />} 
          label="Sessions" 
          active={activeTab === 'sessions'} 
          accent={settings.accent} 
          onClick={() => setActiveTab('sessions')} 
        />
        <NavItem 
          icon={<Calendar size={20} />} 
          label="Today" 
          active={activeTab === 'today'} 
          accent={settings.accent} 
          onClick={() => setActiveTab('today')} 
        />
      </nav>
    </div>
  );
};

export default App;
