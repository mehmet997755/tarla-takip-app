import { useEffect, useMemo } from 'react';
import FieldCard from '../components/FieldCard';
import WorkerList from '../components/WorkerList';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';

export default function Dashboard() {
  const { user } = useAuth();
  const firestore = useFirestore(user);
  const { fields, days, loadFields, loadDays } = firestore;

  useEffect(() => {
    const interval = setInterval(() => {
      loadFields();
      loadDays();
    }, 30_000);
    return () => clearInterval(interval);
  }, [loadFields, loadDays]);

  useEffect(() => {
    loadFields();
    loadDays();
  }, [loadFields, loadDays]);

  const stats = useMemo(() => {
    const totalDays = days.length;
    const totalFields = fields.length;
    const totalEarnings = days.reduce((sum, day) => {
      const field = fields.find((f) => f.id === day.fieldId);
      return sum + (field?.dailyWage || 0);
    }, 0);
    const workers = new Set<string>();
    fields.forEach((f) => f.workers?.forEach((w) => workers.add(w)));
    return {
      totalDays,
      totalFields,
      totalEarnings,
      totalWorkers: workers.size
    };
  }, [days, fields]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hoş geldin {user?.name}</h1>
        <p className="text-sm text-gray-500">Genel durum ve son aktiviteler</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Toplam Tarla" value={stats.totalFields} />
        <StatCard title="Toplam İşçi" value={stats.totalWorkers} />
        <StatCard title="Toplam Gün" value={stats.totalDays} />
        <StatCard title="Toplam Kazanç" value={`₺${stats.totalEarnings}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold">Tarlalar</h2>
          {fields.map((field) => (
            <FieldCard key={field.id} field={field} />
          ))}
          {!fields.length && <div className="text-sm text-gray-500">Henüz tarla yok.</div>}
        </div>
        <WorkerList fields={fields} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-800">
      <div className="text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
