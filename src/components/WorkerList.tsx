import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

interface Props {
  fieldId: string;
}

export default function WorkerList({ fieldId }: Props) {
  const { user } = useAuth();
  const firestore = useFirestore(user);
  const { workers, fields } = firestore;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultDailyWage, setDefaultDailyWage] = useState(0);

  const field = useMemo(() => fields.find((f) => f.id === fieldId), [fields, fieldId]);
  const assigned = useMemo(() => new Set(field?.workers || []), [field]);
  const isAdmin = user?.role === 'admin' || user?.role === 'owner' || user?.uid === field?.userId;

  useEffect(() => {
    firestore.loadWorkers();
  }, []);

  const handleAddWorker = async () => {
    await firestore.addWorker({ name, email, phone, defaultDailyWage, isActive: true });
    setName('');
    setEmail('');
    setPhone('');
    setDefaultDailyWage(0);
  };

  if (!isAdmin) return <p className="text-sm text-slate-500">Sadece yönetici erişebilir.</p>;

  return (
    <div className="space-y-4">
      <Card title="Yeni İşçi Ekle">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <Input label="İsim" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input
            label="Varsayılan Ücret"
            type="number"
            value={defaultDailyWage}
            onChange={(e) => setDefaultDailyWage(Number(e.target.value))}
          />
          <div className="sm:col-span-2 md:col-span-4">
            <Button type="button" onClick={handleAddWorker} disabled={!name || !email}>
              Ekle
            </Button>
          </div>
        </div>
      </Card>

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
            {workers.map((w) => (
              <tr key={w.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="px-3 py-2">{w.name}</td>
                <td className="px-3 py-2">{w.email}</td>
                <td className="px-3 py-2">{w.isActive === false ? 'Pasif' : 'Aktif'}</td>
                <td className="px-3 py-2 space-x-2">
                  {assigned.has(w.id || '') ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => firestore.unassignWorkerFromField(fieldId, w.id)}
                    >
                      Çıkar
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => firestore.assignWorkerToField(fieldId, w.id)}>
                      Ata
                    </Button>
                  )}
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
            {!workers.length && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                  İşçi yok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
