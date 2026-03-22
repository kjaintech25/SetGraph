
export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
}

export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  rpe: number; // Rate of Perceived Exertion (1-10)
  completedAt: string;
  isPB?: boolean;
}

export interface LoggedExercise {
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  name?: string;
  startTime: string;
  endTime?: string;
  exercises: LoggedExercise[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exerciseIds: string[];
}

export interface AnalyticsPoint {
  date: string;
  volume: number;
  maxWeight: number;
}
