
import { Exercise } from './types';

export const EXERCISE_LIBRARY: Exercise[] = [
  { id: '1', name: 'Bench Press', muscleGroup: 'Chest' },
  { id: '2', name: 'Squat', muscleGroup: 'Legs' },
  { id: '3', name: 'Deadlift', muscleGroup: 'Back' },
  { id: '4', name: 'Overhead Press', muscleGroup: 'Shoulders' },
  { id: '5', name: 'Barbell Row', muscleGroup: 'Back' },
  { id: '6', name: 'Bicep Curl', muscleGroup: 'Arms' },
  { id: '7', name: 'Tricep Extension', muscleGroup: 'Arms' },
  { id: '8', name: 'Leg Press', muscleGroup: 'Legs' },
  { id: '9', name: 'Lateral Raise', muscleGroup: 'Shoulders' },
  { id: '10', name: 'Pull Ups', muscleGroup: 'Back' },
];

export const ACCENT_COLORS = [
  { name: 'Emerald', value: 'emerald', hex: '#10b981' },
  { name: 'Blue', value: 'blue', hex: '#3b82f6' },
  { name: 'Purple', value: 'purple', hex: '#a855f7' },
  { name: 'Amber', value: 'amber', hex: '#f59e0b' },
  { name: 'Rose', value: 'rose', hex: '#f43f5e' },
];

export const COLORS = {
  primary: '#10b981', // Emerald 500
  secondary: '#3b82f6', // Blue 500
  background: '#09090b', // Zinc 950
  surface: '#18181b', // Zinc 900
  surfaceLight: '#27272a', // Zinc 800
};
