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
  RotateCcw
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

// --- Utility: Format Time ---
const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s]
    .map(v => v < 10 ? "0" + v : v)
    .filter((v, i) => v !== "00" || i > 0)
    .join(":");
};

// Simplified format for short durations (M:SS)
const formatShortDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// --- Helper Components ---

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  accent: string;
  onClick: () => void 
}> = ({ icon, label, active, accent, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${active ? `text-${accent}-500 scale-110 font-bold` : 'text-zinc-500 hover:text-zinc-300'}`}
  >
    {icon}
    <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
  </button>
);

const SetRow: React.FC<{ 
  set: WorkoutSet; 
  index: number; 
  units: 'kg' | 'lb';
  onDelete: (id: string) => void;
  onUpdate: (id: string, weight: number, reps: number, rpe: number) => void;
  onDuplicate: (set: WorkoutSet) => void;
}> = ({ set, index, units, onDelete, onUpdate, onDuplicate }) => {
  return (
    <div className="grid grid-cols-6 gap-2 items-center py-2 px-3 bg-zinc-800/50 dark:bg-zinc-800/50 rounded-lg mb-2 group transition-colors">
      <div className="text-xs font-bold text-zinc-500 flex items-center">
        {index + 1}
        {set.isPB && <Trophy size={10} className="ml-1 text-yellow-500" />}
      </div>
      <input 
        type="number" 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-1 text-center text-sm w-full outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100" 
        value={set.weight || ''} 
        placeholder={units}
        onChange={(e) => onUpdate(set.id, parseFloat(e.target.value) || 0, set.reps, set.rpe)}
      />
      <input 
        type="number" 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-1 text-center text-sm w-full outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100" 
        value={set.reps || ''} 
        placeholder="reps"
        onChange={(e) => onUpdate(set.id, set.weight, parseInt(e.target.value) || 0, set.rpe)}
      />
      <select 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-1 text-center text-xs w-full outline-none text-zinc-900 dark:text-zinc-100"
        value={set.rpe}
        onChange={(e) => onUpdate(set.id, set.weight, set.reps, parseInt(e.target.value))}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
          <option key={val} value={val}>{val}</option>
        ))}
      </select>
      <button 
        onClick={() => onDuplicate(set)}
        className="flex justify-center text-zinc-500 hover:text-emerald-400"
      >
        <Copy size={16} />
      </button>
      <button 
        onClick={() => onDelete(set.id)}
        className="flex justify-center text-zinc-500 hover:text-red-400"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

// --- Settings Modal Component ---
const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  settings: { theme: 'light' | 'dark', units: 'kg' | 'lb', accent: string, restDuration: number };
  onUpdate: (key: string, value: any) => void;
}> = ({ isOpen, onClose, settings, onUpdate }) => {
  if (!isOpen) return null;
  
  // Define accent class mapping to ensure tailwind picks them up
  const accentTextClass = {
    emerald: 'text-emerald-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    amber: 'text-amber-500',
    rose: 'text-rose-500'
  }[settings.accent] || 'text-emerald-500';

  const accentBgClass = {
    emerald: 'accent-emerald-500',
    blue: 'accent-blue-500',
    purple: 'accent-purple-500',
    amber: 'accent-amber-500',
    rose: 'accent-rose-500'
  }[settings.accent] || 'accent-emerald-500';

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-6 space-y-8 animate-in zoom-in-95 duration-200 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">SETTINGS</h2>
          <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"><X size={20}/></button>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">Preferences</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onUpdate('theme', settings.theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  {settings.theme === 'dark' ? <Moon size={18} className="text-blue-400"/> : <Sun size={18} className="text-amber-500"/>}
                  <span className="text-sm font-bold capitalize text-zinc-800 dark:text-zinc-200">{settings.theme}</span>
                </div>
              </button>
              <button 
                onClick={() => onUpdate('units', settings.units === 'kg' ? 'lb' : 'kg')}
                className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-sm"
              >
                <div className="flex items-center space-x-3 text-zinc-800 dark:text-zinc-200">
                  <Scale size={18}/>
                  <span className="text-sm font-bold uppercase">{settings.units}</span>
                </div>
              </button>
            </div>
          </section>

          {/* Updated Rest Timer Section with Scroll Bar (Range Slider) */}
          <section className="space-y-4">
            <div className="flex justify-between items-end px-1">
              <h3 className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">Rest Timer</h3>
              <div className="flex items-center space-x-2">
                <Timer size={14} className={accentTextClass} />
                <span className={`text-2xl font-black tabular-nums ${accentTextClass}`}>
                  {formatShortDuration(settings.restDuration)}
                </span>
              </div>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-3xl shadow-inner">
              <input 
                type="range"
                min="15"
                max="300"
                step="15"
                value={settings.restDuration}
                onChange={(e) => onUpdate('restDuration', parseInt(e.target.value))}
                className={`w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer ${accentBgClass} transition-all`}
              />
              <div className="flex justify-between mt-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <span>0:15</span>
                <span className="opacity-50">15s steps</span>
                <span>5:00</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">Accent Color</h3>
            <div className="flex flex-wrap gap-3 p-1">
              {ACCENT_COLORS.map(color => (
                <button
                  key={color.value}
                  onClick={() => onUpdate('accent', color.value)}
                  style={{ backgroundColor: color.hex }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${settings.accent === color.value ? 'ring-4 ring-offset-4 dark:ring-offset-zinc-900 ring-zinc-400 dark:ring-zinc-600 scale-110 shadow-lg' : 'opacity-80 hover:opacity-100 hover:scale-105'}`}
                >
                  {settings.accent === color.value && <CheckCircle2 size={20} className="text-white drop-shadow-md" />}
                </button>
              ))}
            </div>
          </section>
        </div>

          <div className="pt-4 text-center border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase opacity-50">VibeSet v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

// --- Custom Exercise Modal ---
const CustomExerciseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  accent: string;
  onAdd: (name: string, muscle: MuscleGroup) => void;
}> = ({ isOpen, onClose, accent, onAdd }) => {
  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup>('Full Body');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2rem] p-6 space-y-6 animate-in zoom-in-95 duration-200 shadow-2xl border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">NEW EXERCISE</h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Exercise Name</label>
            <input 
              autoFocus
              className="w-full bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl outline-none text-zinc-900 dark:text-zinc-100 font-bold"
              placeholder="e.g. Incline DB Press"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Target Muscle</label>
            <select 
              className="w-full bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl outline-none text-zinc-900 dark:text-zinc-100 font-bold appearance-none"
              value={muscle}
              onChange={e => setMuscle(e.target.value as MuscleGroup)}
            >
              {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={onClose} className="flex-1 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl font-bold text-zinc-500">Cancel</button>
          <button 
            disabled={!name.trim()}
            onClick={() => {
              onAdd(name, muscle);
              setName('');
              onClose();
            }}
            className={`flex-1 p-4 bg-${accent}-500 text-white rounded-2xl font-black shadow-lg disabled:opacity-50 transition-all active:scale-95`}
          >
            CREATE
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'log' | 'history' | 'analytics' | 'templates'>('log');
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>(EXERCISE_LIBRARY);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exerciseModalMode, setExerciseModalMode] = useState<'log' | 'template'>('log');
  const [tempSelectedExerciseIds, setTempSelectedExerciseIds] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCustomExerciseModalOpen, setIsCustomExerciseModalOpen] = useState(false);

  const [settings, setSettings] = useState({
    theme: 'dark' as 'light' | 'dark',
    units: 'kg' as 'kg' | 'lb',
    accent: 'emerald',
    restDuration: 60
  });
  
  // Timer states
  const [exerciseTimer, setExerciseTimer] = useState<number | null>(null);
  const [workoutStopwatch, setWorkoutStopwatch] = useState<number>(0);
  
  // Refs
  const timerRef = useRef<any>(null);
  const stopwatchRef = useRef<any>(null);

  // Persistence
  useEffect(() => {
    const savedSessions = localStorage.getItem('vibeset_sessions');
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    
    const savedTemplates = localStorage.getItem('vibeset_templates');
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));

    const savedSettings = localStorage.getItem('vibeset_settings');
    if (savedSettings) setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));

    const savedCustomExercises = localStorage.getItem('vibeset_custom_exercises');
    if (savedCustomExercises) {
      setExercises([...EXERCISE_LIBRARY, ...JSON.parse(savedCustomExercises)]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vibeset_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('vibeset_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('vibeset_settings', JSON.stringify(settings));
    if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [settings]);

  // Exercise Timer logic
  useEffect(() => {
    if (exerciseTimer !== null && exerciseTimer > 0) {
      timerRef.current = setTimeout(() => setExerciseTimer(exerciseTimer - 1), 1000);
    } else if (exerciseTimer === 0) {
      setExerciseTimer(null);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [exerciseTimer]);

  // Stopwatch logic
  useEffect(() => {
    if (currentSession && !currentSession.endTime) {
      stopwatchRef.current = setInterval(() => {
        setWorkoutStopwatch(prev => prev + 1);
      }, 1000);
    } else {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    }
    return () => { if (stopwatchRef.current) clearInterval(stopwatchRef.current); };
  }, [currentSession]);

  const startWorkout = (template?: WorkoutTemplate) => {
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      name: template ? template.name : 'Quick Workout',
      startTime: new Date().toISOString(),
      exercises: template ? template.exerciseIds.map(eid => ({
        exerciseId: eid,
        sets: [{ id: Math.random().toString(), weight: 0, reps: 0, rpe: 8, completedAt: new Date().toISOString() }]
      })) : []
    };
    setCurrentSession(newSession);
    setWorkoutStopwatch(0);
    setActiveTab('log');
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
    setCurrentSession({
      ...currentSession,
      exercises: [...currentSession.exercises, newLogged]
    });
    setIsExerciseModalOpen(false);
  };

  const addCustomExercise = (name: string, muscle: MuscleGroup) => {
    const newEx: Exercise = {
      id: `custom-${Date.now()}`,
      name,
      muscleGroup: muscle
    };
    const updatedExercises = [...exercises, newEx];
    setExercises(updatedExercises);
    
    // Persist custom ones
    const customOnly = updatedExercises.filter(ex => ex.id.startsWith('custom-'));
    localStorage.setItem('vibeset_custom_exercises', JSON.stringify(customOnly));
  };

  const createRoutineFromSelection = () => {
    const name = prompt("Enter Routine Name:");
    if (!name || tempSelectedExerciseIds.length === 0) return;
    
    const newTemplate: WorkoutTemplate = {
      id: Date.now().toString(),
      name,
      exerciseIds: [...tempSelectedExerciseIds]
    };
    setTemplates([...templates, newTemplate]);
    setTempSelectedExerciseIds([]);
    setIsExerciseModalOpen(false);
    setActiveTab('templates');
  };

  const triggerExerciseTimer = () => {
    setExerciseTimer(settings.restDuration); 
  };

  const addSetToExercise = (exerciseId: string, setDefaults?: Partial<WorkoutSet>) => {
    if (!currentSession) return;
    const exerciseLogs = currentSession.exercises.find(e => e.exerciseId === exerciseId);
    const lastSet = exerciseLogs?.sets.slice(-1)[0];
    
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
    triggerExerciseTimer();
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
    if (weight > 0 && reps > 0) triggerExerciseTimer();
  };

  const deleteSet = (exerciseId: string, setId: string) => {
    if (!currentSession) return;
    setCurrentSession({
      ...currentSession,
      exercises: currentSession.exercises.map(e => 
        e.exerciseId === exerciseId ? {
          ...e,
          sets: e.sets.filter(s => s.id !== setId)
        } : e
      )
    });
  };

  const getGhostSession = (exerciseId: string) => {
    for (const session of sessions) {
      const matchingEx = session.exercises.find(e => e.exerciseId === exerciseId);
      if (matchingEx && matchingEx.sets.length > 0) {
        return matchingEx.sets;
      }
    }
    return null;
  };

  const getRecommendation = (sets: WorkoutSet[]) => {
    if (sets.length === 0) return null;
    const last = sets[sets.length - 1];
    if (last.weight === 0 || last.reps === 0) return null;
    
    if (last.rpe <= 7) return { text: `Up weight (+2.5${settings.units})`, color: `text-${settings.accent}-500` };
    if (last.rpe >= 10) return { text: "Decrease load", color: "text-red-400" };
    return { text: "Maintain intensity", color: "text-zinc-500" };
  };

  const chartData = useMemo(() => {
    const dailyVolume: Record<string, number> = {};
    sessions.forEach(s => {
      const date = new Date(s.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const vol = s.exercises.reduce((acc, ex) => acc + ex.sets.reduce((setAcc, set) => setAcc + (set.weight * set.reps), 0), 0);
      dailyVolume[date] = (dailyVolume[date] || 0) + vol;
    });
    return Object.entries(dailyVolume).map(([date, volume]) => ({ date, volume })).reverse();
  }, [sessions]);

  // --- UI Render Sections ---

  const renderLog = () => {
    if (!currentSession) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 space-y-6">
          <div className={`p-6 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-2xl transition-all duration-500`}>
            <Dumbbell size={64} className={`text-${settings.accent}-500 animate-pulse`} />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase italic">VIBE<span className={`text-${settings.accent}-500`}>SET</span></h2>
            <p className="text-zinc-500 text-sm max-w-[240px] mt-1">Ready for your next PR? Start a session below.</p>
          </div>
          <div className="w-full max-w-[280px] space-y-3">
            <button 
              onClick={() => startWorkout()}
              className={`w-full bg-${settings.accent}-500 hover:opacity-90 text-white font-black py-4 rounded-xl flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow-xl`}
            >
              <Plus size={20} strokeWidth={3} />
              <span className="uppercase tracking-widest">Start Quick Workout</span>
            </button>
            <button 
              onClick={() => setActiveTab('templates')}
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-transform active:scale-95"
            >
              <Layout size={20} />
              <span className="uppercase tracking-widest">My Routines</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 pb-32 space-y-6 overflow-y-auto h-full">
        {/* Lockscreen Timers Display */}
        <div className="bg-zinc-100/90 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 flex flex-col space-y-4 shadow-2xl transition-all sticky top-2 z-40">
           <div className="flex justify-between items-center bg-white/50 dark:bg-black/40 p-5 rounded-2xl border border-white/40 dark:border-white/5 relative overflow-hidden group shadow-sm">
              <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${exerciseTimer !== null ? `text-${settings.accent}-500` : 'text-zinc-400'}`}>REST TIMER</span>
                <span className={`text-4xl font-black font-mono leading-none ${exerciseTimer !== null ? `text-${settings.accent}-500` : 'text-zinc-300'}`}>
                  {exerciseTimer !== null ? `${exerciseTimer}s` : '--:--'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => triggerExerciseTimer()}
                  className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm"
                  title="Reset Timer"
                >
                  <RotateCcw size={20} />
                </button>
                {exerciseTimer !== null && (
                  <button 
                    onClick={() => setExerciseTimer(null)}
                    className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    title="Stop Timer"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              {/* Progress Bar for Timer */}
              {exerciseTimer !== null && (
                <div 
                  className={`absolute bottom-0 left-0 h-1 bg-${settings.accent}-500 transition-all duration-1000 ease-linear`}
                  style={{ width: `${(exerciseTimer / settings.restDuration) * 100}%` }}
                />
              )}
           </div>

           <div className="flex justify-between items-center px-2">
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">SESSION STOPWATCH</span>
               <span className="text-xl font-black font-mono leading-none text-zinc-900 dark:text-zinc-100 tabular-nums">{formatTime(workoutStopwatch)}</span>
             </div>
             <button 
                onClick={finishWorkout}
                className={`text-white font-black text-sm bg-${settings.accent}-500 px-6 py-3 rounded-xl shadow-lg active:scale-95 transition-all uppercase tracking-widest`}
              >
                FINISH
              </button>
           </div>
        </div>

        <div className="flex justify-between items-center mb-4 pt-2 px-1">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">{currentSession.name}</span>
            <span className="text-[10px] font-black text-zinc-400 uppercase">PROGRESSIVE OVERLOAD ENABLED</span>
          </div>
          <button 
              onClick={() => {
                const name = prompt("Routine Name:", currentSession.name);
                if(name) setTemplates([...templates, { id: Date.now().toString(), name, exerciseIds: currentSession.exercises.map(e => e.exerciseId) }]);
              }}
              className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-2xl text-zinc-500 hover:text-white transition-colors shadow-sm"
            >
              <Save size={20} />
          </button>
        </div>

        {currentSession.exercises.map((log) => {
          const exercise = exercises.find(e => e.id === log.exerciseId);
          const ghostSets = getGhostSession(log.exerciseId);
          const recommendation = getRecommendation(log.sets);

          return (
            <div key={log.exerciseId} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-xl transition-all mb-4">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/20">
                <div className="flex-1">
                  <h3 className="font-black text-lg leading-tight text-zinc-900 dark:text-zinc-100">{exercise?.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded font-black">{exercise?.muscleGroup}</span>
                    {recommendation && (
                      <span className={`text-[10px] font-black uppercase tracking-tighter ${recommendation.color}`}>{recommendation.text}</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => addSetToExercise(log.exerciseId)}
                  className={`p-3 bg-${settings.accent}-500 text-white rounded-2xl shadow-lg hover:opacity-90 active:scale-90 transition-all`}
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>

              {ghostSets && (
                <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center space-x-1 mb-1">
                    <History size={10} className="text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Last Performance</span>
                  </div>
                  <div className="flex space-x-4">
                    {ghostSets.slice(0, 2).map((gs, i) => (
                      <div key={gs.id} className="text-[10px] text-zinc-500 font-mono">
                        S{i+1}: <span className="text-zinc-700 dark:text-zinc-200 font-bold">{gs.weight}{settings.units} x {gs.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-5">
                <div className="grid grid-cols-6 gap-2 px-3 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                  <div>SET</div>
                  <div className="text-center">{settings.units.toUpperCase()}</div>
                  <div className="text-center">REPS</div>
                  <div className="text-center">RPE</div>
                  <div className="text-center"></div>
                  <div className="text-center"></div>
                </div>
                {log.sets.map((set, idx) => (
                  <SetRow 
                    key={set.id} 
                    set={set} 
                    index={idx} 
                    units={settings.units}
                    onDelete={(id) => deleteSet(log.exerciseId, id)}
                    onUpdate={(id, w, r, rp) => updateSet(log.exerciseId, id, w, r, rp)}
                    onDuplicate={(s) => addSetToExercise(log.exerciseId, { weight: s.weight, reps: s.reps, rpe: s.rpe })}
                  />
                ))}
              </div>
            </div>
          );
        })}

        <button 
          onClick={() => {
            setExerciseModalMode('log');
            setIsExerciseModalOpen(true);
          }}
          className="w-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-12 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col items-center justify-center space-y-3 bg-zinc-50/50 dark:bg-zinc-900/10 group"
        >
          <PlusCircle size={40} className="transition-transform group-hover:scale-110" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">Add Next Exercise</span>
        </button>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="p-4 space-y-4 pb-24 h-full overflow-y-auto">
      <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight px-1 pt-4">Training Log</h2>
      {sessions.length === 0 ? (
        <div className="text-center py-32 text-zinc-500 italic opacity-50 flex flex-col items-center">
          <History size={64} className="mb-6" />
          <p className="font-black uppercase tracking-widest text-sm">Silence in the gym...</p>
          <p className="text-xs mt-2">Your recorded sessions will appear here.</p>
        </div>
      ) : (
        sessions.map(s => (
          <div key={s.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] p-6 relative group hover:border-zinc-200 dark:hover:border-zinc-700 transition-all shadow-lg">
            <button 
              onClick={() => deleteSession(s.id)}
              className="absolute top-6 right-6 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl"
            >
              <Trash2 size={20} />
            </button>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">{new Date(s.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <h3 className="font-black text-xl mb-4 tracking-tight text-zinc-900 dark:text-zinc-100 uppercase italic">{s.name || 'Strength Session'}</h3>
            <div className="flex flex-wrap gap-2">
              {s.exercises.map(ex => {
                const info = exercises.find(e => e.id === ex.exerciseId);
                return (
                  <span key={ex.exerciseId} className="text-[10px] bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 px-3 py-1.5 rounded-xl font-black uppercase tracking-tighter">
                    {info?.name} <span className={`text-${settings.accent}-500 ml-1`}>{ex.sets.length}S</span>
                  </span>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto">
      <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight px-1 pt-4">Analytics</h2>
      
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 h-96 shadow-2xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Tonnage Progression</h4>
            <p className="text-[10px] font-bold text-zinc-400">Total volume moved per session</p>
          </div>
          <div className={`bg-${settings.accent}-500/10 text-${settings.accent}-500 text-[10px] px-3 py-1.5 rounded-full font-black tracking-widest`}>LOAD CHART</div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT_COLORS.find(c => c.value === settings.accent)?.hex} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={ACCENT_COLORS.find(c => c.value === settings.accent)?.hex} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.1} />
              <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} fontWeight="bold" />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: settings.theme === 'dark' ? '#18181b' : '#ffffff', border: 'none', borderRadius: '20px', fontSize: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                itemStyle={{ color: ACCENT_COLORS.find(c => c.value === settings.accent)?.hex, fontWeight: '900', textTransform: 'uppercase' }}
                cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="volume" stroke={ACCENT_COLORS.find(c => c.value === settings.accent)?.hex} fillOpacity={1} fill="url(#colorVol)" strokeWidth={5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-xl">
          <div className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mb-3">Sessions</div>
          <div className={`text-5xl font-black text-${settings.accent}-500 tabular-nums italic`}>
            {sessions.length}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-xl">
          <div className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mb-3">All-Time PBs</div>
          <div className="text-5xl font-black text-blue-500 dark:text-blue-400 tabular-nums italic">
            {sessions.reduce((acc, s) => acc + s.exercises.reduce((exAcc, ex) => exAcc + ex.sets.filter(st => st.isPB).length, 0), 0)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col h-screen ${settings.theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'} text-zinc-900 dark:text-zinc-50 max-w-md mx-auto relative shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden font-inter border-x border-zinc-100 dark:border-zinc-900 transition-colors duration-500`}>
      {/* Header */}
      <header className={`p-6 pt-12 flex justify-between items-center ${settings.theme === 'dark' ? 'bg-zinc-950/80' : 'bg-white/80'} backdrop-blur-xl z-20 sticky top-0 px-8 border-b border-transparent`}>
        <div className="flex items-center space-x-3">
          <div className={`w-11 h-11 bg-${settings.accent}-500 rounded-2xl flex items-center justify-center shadow-2xl transition-all hover:rotate-12`}>
            <Zap size={24} className="text-white" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter italic text-zinc-900 dark:text-zinc-100 uppercase">VIBE<span className={`text-${settings.accent}-500`}>SET</span></h1>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 rounded-2xl transition-all shadow-md active:scale-90"
        >
          <SettingsIcon size={24} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'log' && renderLog()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'templates' && (
           <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto">
              <div className="flex justify-between items-center px-1 pt-6 mb-2">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight italic">My Routines</h2>
                <button 
                  onClick={() => {
                    setExerciseModalMode('template');
                    setTempSelectedExerciseIds([]);
                    setIsExerciseModalOpen(true);
                  }} 
                  className={`p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-${settings.accent}-500 shadow-xl transition-all active:scale-95`}
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>
              {templates.length === 0 && (
                <div className="text-center py-32 text-zinc-500 opacity-40 flex flex-col items-center">
                  <Layout size={80} strokeWidth={1} className="mb-6" />
                  <p className="font-black uppercase tracking-[0.2em] text-sm">No systems detected</p>
                  <p className="text-xs mt-2 font-bold italic">Standardize your training by building routines.</p>
                </div>
              )}
              {templates.map(t => (
                <div key={t.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 flex justify-between items-center hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-xl group">
                   <div>
                      <h3 className="font-black text-xl text-zinc-900 dark:text-zinc-100 mb-1 uppercase tracking-tight">{t.name}</h3>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-black">{t.exerciseIds.length} LOADED EXERCISES</p>
                   </div>
                   <div className="flex space-x-3">
                      <button onClick={() => setTemplates(templates.filter(temp => temp.id !== t.id))} className="p-4 text-zinc-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={24}/></button>
                      <button onClick={() => startWorkout(t)} className={`p-5 bg-${settings.accent}-500 text-white rounded-[1.5rem] shadow-2xl active:scale-95 transition-all`}><Play size={28} fill="currentColor"/></button>
                   </div>
                </div>
              ))}
           </div>
        )}
      </main>

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onUpdate={(k, v) => setSettings(prev => ({ ...prev, [k]: v }))}
      />

      <CustomExerciseModal 
        isOpen={isCustomExerciseModalOpen}
        onClose={() => setIsCustomExerciseModalOpen(false)}
        accent={settings.accent}
        onAdd={addCustomExercise}
      />

      {isExerciseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md h-[90vh] rounded-t-[4rem] sm:rounded-[4rem] border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500 shadow-[0_-30px_100px_rgba(0,0,0,0.8)] relative">
            <div className="p-10 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <div className="flex flex-col">
                <h3 className="font-black text-3xl tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase italic">
                  {exerciseModalMode === 'log' ? 'Protocol' : 'Builder'}
                </h3>
                {exerciseModalMode === 'template' && (
                  <span className={`text-[10px] font-black text-${settings.accent}-500 uppercase tracking-[0.3em] mt-2`}>
                    {tempSelectedExerciseIds.length} SYSTEM{tempSelectedExerciseIds.length !== 1 ? 'S' : ''} SELECTED
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                 <button 
                  onClick={() => setIsCustomExerciseModalOpen(true)}
                  className={`p-4 bg-${settings.accent}-500/10 text-${settings.accent}-500 rounded-3xl hover:bg-${settings.accent}-500/20 transition-all shadow-sm`}
                  title="Create New Exercise"
                >
                  <PlusCircle size={28} />
                </button>
                <button onClick={() => { setIsExerciseModalOpen(false); setTempSelectedExerciseIds([]); }} className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-3xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all"><X size={28}/></button>
              </div>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto pb-48">
              {exercises.map(ex => {
                const isSelected = tempSelectedExerciseIds.includes(ex.id);
                return (
                  <button 
                    key={ex.id}
                    onClick={() => {
                      if (exerciseModalMode === 'log') {
                        addExerciseToWorkout(ex);
                      } else {
                        setTempSelectedExerciseIds(prev => 
                          prev.includes(ex.id) ? prev.filter(id => id !== ex.id) : [...prev, ex.id]
                        );
                      }
                    }}
                    className={`w-full text-left p-8 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-[2.5rem] transition-all border-4 ${isSelected ? `border-${settings.accent}-500 bg-${settings.accent}-500/10` : 'border-transparent hover:border-zinc-200 dark:hover:border-zinc-700'} flex justify-between items-center group relative overflow-hidden shadow-sm`}
                  >
                    <div>
                      <div className={`font-black text-xl text-zinc-900 dark:text-zinc-100 group-hover:text-${settings.accent}-500 transition-colors uppercase italic tracking-tight`}>{ex.name}</div>
                      <div className="text-[10px] text-zinc-400 uppercase font-black tracking-[0.2em] mt-2">{ex.muscleGroup}</div>
                    </div>
                    {exerciseModalMode === 'log' ? (
                      <Plus size={32} className="text-zinc-200 group-hover:text-emerald-500 transition-all group-hover:rotate-90" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all ${isSelected ? `bg-${settings.accent}-500 border-${settings.accent}-500 scale-110 shadow-lg` : 'border-zinc-200 dark:border-zinc-700'}`}>
                        {isSelected && <Check size={24} className="text-white" strokeWidth={5} />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {exerciseModalMode === 'template' && tempSelectedExerciseIds.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-white dark:from-zinc-900 via-white dark:via-zinc-900 to-transparent pointer-events-none">
                <button 
                  onClick={createRoutineFromSelection}
                  className={`w-full p-6 bg-${settings.accent}-500 text-white font-black rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] pointer-events-auto transform transition-transform active:scale-95 flex items-center justify-center space-x-4`}
                >
                  <Save size={28} />
                  <span className="uppercase tracking-[0.3em] text-xl italic">INITIALIZE ROUTINE</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 ${settings.theme === 'dark' ? 'bg-zinc-950/95' : 'bg-white/95'} backdrop-blur-2xl border-t border-zinc-100 dark:border-zinc-900 h-32 px-10 flex justify-between items-center z-30 max-w-md mx-auto shadow-[0_-20px_50px_rgba(0,0,0,0.1)] transition-colors duration-500 pb-4`}>
        <NavItem icon={<Dumbbell size={32} strokeWidth={2.5} />} label="LOG" active={activeTab === 'log'} accent={settings.accent} onClick={() => setActiveTab('log')} />
        <NavItem icon={<Layout size={32} strokeWidth={2.5} />} label="ROUTINES" active={activeTab === 'templates'} accent={settings.accent} onClick={() => setActiveTab('templates')} />
        <NavItem icon={<History size={32} strokeWidth={2.5} />} label="HISTORY" active={activeTab === 'history'} accent={settings.accent} onClick={() => setActiveTab('history')} />
        <NavItem icon={<BarChart2 size={32} strokeWidth={2.5} />} label="STATS" active={activeTab === 'analytics'} accent={settings.accent} onClick={() => setActiveTab('analytics')} />
      </nav>
    </div>
  );
};

export default App;
