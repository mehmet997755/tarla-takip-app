import { useAuth } from '../../hooks/useAuth';
import { useFirestore } from '../../hooks/useFirestore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useEffect } from 'react';

export default function AdminWorkers() {
  const { user } = useAuth();
  const firestore = useFirestore(user);

  useEffect(() => {
    firestore.loadWorkers();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Admin - İşçiler</h1>
      <Card title="İşçi Listesi">
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-3 py-2">İsim</th>
                <th className="px-3 py-2">E-posta</th>
                <th className="px-3 py-2">Durum</th>
                <th className="px-3 py-2">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {firestore.workers.map((w) => (
                <tr key={w.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2">{w.name}</td>
                  <td className="px-3 py-2">{w.email}</td>
                  <td className="px-3 py-2">{w.isActive === false ? 'Pasif' : 'Aktif'}</td>
                  <td className="px-3 py-2 space-x-2">
                    <Button
                      variant={w.isActive === false ? 'secondary' : 'danger'}
                      size="sm"
                      onClick={() => firestore.updateWorker(w.id, { isActive: w.isActive === false ? true : false })}
                    >
                      {w.isActive === false ? 'Aktif Et' : 'Pasifleştir'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
