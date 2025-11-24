import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, CartesianGrid, Line, LineChart } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const firestore = useFirestore(user);
  const { fields, days, workers } = firestore;

  const stats = useMemo(() => {
    const totalDays = days.length;
    const totalFields = fields.length;
    const totalWorkers = workers.filter((w) => w.isActive !== false).length;
    const unpaid = days.reduce((sum, d) => sum + (d.calculatedAmount || 0), 0);
    return { totalDays, totalFields, totalWorkers, unpaid };
  }, [days, fields, workers]);

  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    days.forEach((d) => {
      const key = new Date(d.date.seconds ? d.date.seconds * 1000 : d.date).toLocaleDateString('tr-TR');
      grouped[key] = (grouped[key] || 0) + (d.calculatedAmount || 0);
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [days]);

  const productionData = fields.map((f) => ({ name: f.name, value: f.dailyWage * (days.filter((d) => d.fieldId === f.id).length || 0) }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gösterge Paneli</h1>
        <Link to="/add-field">
          <Button>Yeni Tarla</Button>
        </Link>
      </div>

      <div className="card-grid">
        <Card title="Toplam Tarla"> <div className="text-3xl font-bold">{stats.totalFields}</div> </Card>
        <Card title="Aktif İşçi"> <div className="text-3xl font-bold">{stats.totalWorkers}</div> </Card>
        <Card title="Toplam Gün"> <div className="text-3xl font-bold">{stats.totalDays}</div> </Card>
        <Card title="Ödenmemiş"> <div className="text-3xl font-bold text-amber-500">₺{stats.unpaid.toFixed(2)}</div> </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Gün Bazlı Kazanç">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Tarla Bazlı Üretim">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
