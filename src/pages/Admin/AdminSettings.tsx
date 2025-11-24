import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';

export default function AdminSettings() {
  const { user } = useAuth();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Ayarlar</h1>
      <Card title="Genel">
        <p className="text-sm text-slate-600 dark:text-slate-300">Admin: {user?.email}</p>
      </Card>
    </div>
  );
}
