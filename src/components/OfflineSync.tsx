import { useEffect, useState } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export default function OfflineSync() {
  const { user } = useAuth();
  const firestore = useFirestore(user);
  const [pending, setPending] = useState<number>(0);

  useEffect(() => {
    const queue = localStorage.getItem('offlineQueue');
    setPending(queue ? JSON.parse(queue).length : 0);
  }, []);

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-72">
      <Card
        title="Çevrimdışı Kuyruk"
        actions={
          <Button variant="secondary" onClick={() => firestore.processQueue()}>
            Senkronize Et
          </Button>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Bekleyen işlem: <span className="font-semibold">{pending}</span>
        </p>
      </Card>
    </div>
  );
}
