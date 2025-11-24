import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  db,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where
} from '../firebase';
import { AppUser, DayEntry, Field, OfflineTask, WorkerProfile } from '../types';

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
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginationCursor, setPaginationCursor] = useState<any>(null);

  const fieldsRef = useMemo(() => collection(db, 'fields'), []);
  const daysRef = useMemo(() => collection(db, 'days'), []);
  const usersRef = useMemo(() => collection(db, 'users'), []);
  const workerRef = useMemo(() => collection(db, 'workers'), []);

  const loadFields = useCallback(
    async (withPagination = false) => {
      if (!user) return;
      setLoading(true);
      try {
        let fieldQuery;
        if (user.role === 'employer' || user.role === 'owner') {
          fieldQuery = query(fieldsRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        } else if (user.role === 'admin') {
          fieldQuery = query(fieldsRef, orderBy('createdAt', 'desc'));
        } else {
          fieldQuery = query(fieldsRef, where('workers', 'array-contains', user.uid), orderBy('createdAt', 'desc'));
        }
        if (withPagination && paginationCursor) {
          fieldQuery = query(fieldQuery, startAfter(paginationCursor), limit(20));
        }
        const snapshot = await getDocs(fieldQuery);
        const data: Field[] = snapshot.docs
          .map((d) => ({ id: d.id, ...(d.data() as Field) }))
          .filter((f) => f.status !== 'archived');
        setFields((prev) => (withPagination ? [...prev, ...data] : data));
        if (snapshot.docs.length) setPaginationCursor(snapshot.docs[snapshot.docs.length - 1]);
      } finally {
        setLoading(false);
      }
    },
    [fieldsRef, paginationCursor, user]
  );

  const loadDays = useCallback(
    async (fieldId?: string) => {
      if (!user) return;
      const fieldIds = fieldId ? [fieldId] : fields.map((f) => f.id);
      if (!fieldIds.length) {
        setDays([]);
        return;
      }
      const slice = fieldIds.slice(0, 10);
      const dayQuery = query(daysRef, where('fieldId', 'in', slice), orderBy('date', 'desc'));
      const snapshot = await getDocs(dayQuery);
      const data: DayEntry[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as DayEntry) }));
      setDays((prev) => {
        if (fieldId) return data;
        return data;
      });
    },
    [daysRef, fields, user]
  );

  const loadWorkers = useCallback(async () => {
    const snapshot = await getDocs(workerRef);
    const workerDocs = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as WorkerProfile) }));
    setWorkers(workerDocs);
    return workerDocs;
  }, [workerRef]);

  const loadUsers = useCallback(async () => {
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
          status: payload.status || 'active',
          createdAt: serverTimestamp()
        });
        setFields((prev) => [...prev, { ...payload, id: docRef.id }]);
      } catch (error) {
        enqueue({ type: 'addField', payload });
      }
    },
    [fieldsRef]
  );

  const updateField = useCallback(
    async (id: string, updates: Partial<Field>) => {
      await updateDoc(doc(fieldsRef, id), updates);
      setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    },
    [fieldsRef]
  );

  const archiveField = useCallback(
    async (id: string) => {
      await updateDoc(doc(fieldsRef, id), { status: 'archived' });
      setFields((prev) => prev.filter((f) => f.id !== id));
    },
    [fieldsRef]
  );

  const addDay = useCallback(
    async (payload: Omit<DayEntry, 'id'>) => {
      try {
        const docRef = await addDoc(daysRef, { ...payload, createdAt: serverTimestamp() });
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

  const unassignWorkerFromField = useCallback(
    async (fieldId: string, workerId: string) => {
      await updateDoc(doc(fieldsRef, fieldId), {
        workers: arrayRemove(workerId)
      });
      setFields((prev) => prev.map((field) => (field.id === fieldId ? { ...field, workers: (field.workers || []).filter((w) => w !== workerId) } : field)));
    },
    [fieldsRef]
  );

  const addWorker = useCallback(
    async (payload: Omit<WorkerProfile, 'id'>) => {
      try {
        const docRef = await addDoc(workerRef, { ...payload, createdAt: serverTimestamp(), isActive: payload.isActive ?? true });
        setWorkers((prev) => [...prev, { ...payload, id: docRef.id }]);
      } catch (error) {
        enqueue({ type: 'addWorker', payload });
      }
    },
    [workerRef]
  );

  const updateWorker = useCallback(
    async (id: string, updates: Partial<WorkerProfile>) => {
      await updateDoc(doc(workerRef, id), updates);
      setWorkers((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    },
    [workerRef]
  );

  const processQueue = useCallback(async () => {
    if (!navigator.onLine) return;
    const queue = readQueue();
    if (!queue.length) return;
    const remaining: OfflineTask[] = [];
    for (const task of queue) {
      try {
        if (task.type === 'addField') {
          const payload = task.payload as Omit<Field, 'id' | 'createdAt'>;
          await addDoc(fieldsRef, { ...payload, createdAt: serverTimestamp() });
        }
        if (task.type === 'addDay') {
          const payload = task.payload as Omit<DayEntry, 'id'>;
          await addDoc(daysRef, { ...payload, createdAt: serverTimestamp() });
        }
        if (task.type === 'addWorker') {
          const payload = task.payload as Omit<WorkerProfile, 'id'>;
          await addDoc(workerRef, { ...payload, createdAt: serverTimestamp() });
        }
      } catch (error) {
        remaining.push(task);
      }
    }
    writeQueue(remaining);
  }, [fieldsRef, daysRef, workerRef]);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  useEffect(() => {
    loadDays();
  }, [loadDays]);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  useEffect(() => {
    const handler = () => processQueue();
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  }, [processQueue]);

  return {
    fields,
    days,
    workers,
    loading,
    addField,
    updateField,
    archiveField,
    addDay,
    deleteDay,
    assignWorkerToField,
    unassignWorkerFromField,
    addWorker,
    updateWorker,
    loadFields,
    loadDays,
    loadWorkers,
    loadUsers,
    processQueue
  };
}
