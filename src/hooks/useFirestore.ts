import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  arrayUnion,
  collection,
  db,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from '../firebase';
import { AppUser, DayEntry, Field, OfflineTask } from '../types';

const OFFLINE_QUEUE_KEY = 'offlineQueue';

function readQueue(): OfflineTask[] {
  const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OfflineTask[];
  } catch (error) {
    console.error('offline queue parse error', error);
    return [];
  }
}

function writeQueue(queue: OfflineTask[]) {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function useFirestore(user: AppUser | null) {
  const [fields, setFields] = useState<Field[]>([]);
  const [days, setDays] = useState<DayEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fieldsRef = useMemo(() => collection(db, 'fields'), []);
  const daysRef = useMemo(() => collection(db, 'days'), []);
  const usersRef = useMemo(() => collection(db, 'users'), []);

  const loadFields = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let fieldQuery;
      if (user.role === 'employer') {
        fieldQuery = query(fieldsRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      } else {
        fieldQuery = query(fieldsRef, where('workers', 'array-contains', user.uid), orderBy('createdAt', 'desc'));
      }
      const snapshot = await getDocs(fieldQuery);
      const data: Field[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Field) }));
      setFields(data);
    } finally {
      setLoading(false);
    }
  }, [fieldsRef, user]);

  const loadDays = useCallback(async () => {
    if (!user) return;
    const fieldIds = fields.map((f) => f.id);
    if (!fieldIds.length) {
      setDays([]);
      return;
    }
    const dayQuery = query(daysRef, where('fieldId', 'in', fieldIds.slice(0, 10)), orderBy('date', 'desc'));
    const snapshot = await getDocs(dayQuery);
    const data: DayEntry[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as DayEntry) }));
    setDays(data);
  }, [daysRef, fields, user]);

  const loadWorkers = useCallback(async () => {
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map((d) => d.data() as AppUser);
  }, [usersRef]);

  const enqueue = (task: OfflineTask) => {
    const queue = readQueue();
    queue.push(task);
    writeQueue(queue);
  };

  const addField = useCallback(
    async (payload: Omit<Field, 'id' | 'createdAt'>) => {
      try {
        const docRef = await addDoc(fieldsRef, {
          ...payload,
          createdAt: serverTimestamp()
        });
        setFields((prev) => [...prev, { ...payload, id: docRef.id }]);
      } catch (error) {
        enqueue({ type: 'addField', payload });
      }
    },
    [fieldsRef]
  );

  const addDay = useCallback(
    async (payload: Omit<DayEntry, 'id'>) => {
      try {
        const docRef = await addDoc(daysRef, payload);
        setDays((prev) => [{ ...payload, id: docRef.id }, ...prev]);
      } catch (error) {
        enqueue({ type: 'addDay', payload });
      }
    },
    [daysRef]
  );

  const deleteDay = useCallback(
    async (id: string) => {
      await deleteDoc(doc(daysRef, id));
      setDays((prev) => prev.filter((d) => d.id !== id));
    },
    [daysRef]
  );

  const assignWorkerToField = useCallback(
    async (fieldId: string, workerId: string) => {
      await updateDoc(doc(fieldsRef, fieldId), {
        workers: arrayUnion(workerId)
      });
      setFields((prev) =>
        prev.map((field) =>
          field.id === fieldId ? { ...field, workers: Array.from(new Set([...(field.workers || []), workerId])) } : field
        )
      );
    },
    [fieldsRef]
  );

  const processQueue = useCallback(async () => {
    if (!navigator.onLine) return;
    const queue = readQueue();
    if (!queue.length) return;
    const remaining: OfflineTask[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const task of queue) {
      try {
        if (task.type === 'addField') {
          const payload = task.payload as Omit<Field, 'id' | 'createdAt'>;
          await addDoc(fieldsRef, { ...payload, createdAt: serverTimestamp() });
        }
        if (task.type === 'addDay') {
          const payload = task.payload as Omit<DayEntry, 'id'>;
          await addDoc(daysRef, payload);
        }
      } catch (error) {
        remaining.push(task);
      }
    }
    writeQueue(remaining);
  }, [fieldsRef, daysRef]);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  useEffect(() => {
    loadDays();
  }, [loadDays]);

  useEffect(() => {
    const handler = () => processQueue();
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  }, [processQueue]);

  return {
    fields,
    days,
    loading,
    addField,
    addDay,
    deleteDay,
    assignWorkerToField,
    loadFields,
    loadDays,
    loadWorkers,
    processQueue
  };
}
