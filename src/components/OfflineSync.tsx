import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';

export default function OfflineSync() {
  const { user } = useAuth();
  const { processQueue } = useFirestore(user);
  const [online, setOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handle = () => setOnline(navigator.onLine);
    window.addEventListener('online', handle);
    window.addEventListener('offline', handle);
    return () => {
      window.removeEventListener('online', handle);
      window.removeEventListener('offline', handle);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100">
      <div className="text-sm">
        Durum: {online ? 'Çevrimiçi' : 'Çevrimdışı'} - Çevrimiçi olduğunuzda kuyruk otomatik senkronize edilir.
      </div>
      <button
        onClick={processQueue}
        className="rounded-md bg-amber-600 px-3 py-1 text-xs font-semibold text-white"
      >
        Kuyruğu Senkronize Et
      </button>
    </div>
  );
}
