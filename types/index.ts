export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drinks';

export const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack', 'drinks'];

export const MEAL_LABELS: Record<Meal, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  drinks: 'Drinks',
};

export interface LogEntry {
  time: string; // "HH:MM"
  food: string;
  qty: string;
  meal: Meal | null;
  notes: string | null;
}

export interface QuickButton {
  label: string;
  food: string;
  qty: string;
}

// Shape of the JSON file stored in the user's Google Drive.
export interface DriveData {
  logs: Record<string, LogEntry[]>; // keyed by "YYYY-MM-DD"
  quickButtons: QuickButton[];
  updatedAt: string;
}
