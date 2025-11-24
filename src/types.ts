export type UserRole = 'employer' | 'worker';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  photoURL?: string | null;
}

export interface Field {
  id: string;
  name: string;
  location: string;
  address: string;
  type: string;
  dailyWage: number;
  userId: string;
  workers: string[];
  createdAt?: string;
}

export interface DayEntry {
  id: string;
  fieldId: string;
  date: string;
  note?: string;
}

export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
}

export interface OfflineTask {
  type: 'addField' | 'addDay';
  payload: Record<string, unknown>;
}
