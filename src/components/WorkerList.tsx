import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { AppUser, Field } from '../types';

interface Props {
  fields: Field[];
}

export default function WorkerList({ fields }: Props) {
  const { user } = useAuth();
  const { loadWorkers } = useFirestore(user);
  const [workers, setWorkers] = useState<AppUser[]>([]);

  useEffect(() => {
    loadWorkers().then(setWorkers);
  }, [loadWorkers]);

  if (user?.role !== 'employer') return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">İşçiler</h3>
          <p className="text-sm text-gray-500">Davet edilen ve mevcut işçiler</p>
        </div>
      </div>
      <div className="mt-4 divide-y divide-gray-200 text-sm dark:divide-gray-700">
        {workers.map((worker) => {
          const assigned = fields.filter((f) => f.workers?.includes(worker.uid));
          return (
            <div key={worker.uid} className="py-3">
              <div className="font-semibold">{worker.name}</div>
              <div className="text-gray-500">{worker.email}</div>
              <div className="text-xs text-gray-500">Atanan tarlalar: {assigned.length}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
