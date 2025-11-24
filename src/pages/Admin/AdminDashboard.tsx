import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFirestore } from '../../hooks/useFirestore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function AdminDashboard() {
  const { user } = useAuth();
  const firestore = useFirestore(user);
  const { fields, workers, days } = firestore;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Button variant="secondary" as="a" href="/admin/reports">
          Raporlar
        </Button>
      </div>
      <div className="card-grid">
        <Card title="Aktif Tarlalar">
          <div className="text-3xl font-bold">{fields.length}</div>
        </Card>
        <Card title="İşçi Sayısı">
          <div className="text-3xl font-bold">{workers.length}</div>
        </Card>
        <Card title="Gün Kayıtları">
          <div className="text-3xl font-bold">{days.length}</div>
        </Card>
        <Card title="Hızlı İşlemler">
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/fields">
              <Button size="sm">Tarlalar</Button>
            </Link>
            <Link to="/admin/workers">
              <Button size="sm">İşçiler</Button>
            </Link>
            <Link to="/admin/reports">
              <Button size="sm">Raporlar</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
