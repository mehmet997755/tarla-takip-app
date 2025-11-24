export type UserRole = 'employer' | 'worker' | 'admin' | 'owner';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  photoURL?: string;
}

export interface Field {
  id: string;
  name: string;
  type: string;
  location: string;
  address: string;
  dailyWage: number;
  userId: string;
  workers?: string[];
  status?: 'active' | 'archived';
  createdAt?: any;
}

export type DayType = 'full-day' | 'half-day' | 'custom-hours';

export interface DayEntry {
  id: string;
  fieldId: string;
  workerId?: string;
  date: any;
  dayType: DayType;
  hours?: number;
  note?: string;
  calculatedAmount: number;
  createdAt?: any;
}

export interface WorkerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  defaultDailyWage?: number;
  isActive?: boolean;
  invitedFieldId?: string;
  userId?: string;
  createdAt?: any;
}

export type OfflineTask =
  | { type: 'addField'; payload: Omit<Field, 'id' | 'createdAt'> }
  | { type: 'addDay'; payload: Omit<DayEntry, 'id'> }
  | { type: 'addWorker'; payload: Omit<WorkerProfile, 'id'> };
