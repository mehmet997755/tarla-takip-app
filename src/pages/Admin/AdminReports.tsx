import { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFirestore } from '../../hooks/useFirestore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function AdminReports() {
  const { user } = useAuth();
  const { days } = useFirestore(user);

  const exportCsv = () => {
    const header = 'Tarih;Tutar\n';
    const rows = days.map((d) => `${new Date(d.date.seconds ? d.date.seconds * 1000 : d.date).toLocaleDateString('tr-TR')};${d.calculatedAmount}`);
    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rapor.csv';
    link.click();
  };

  const totals = useMemo(() => days.reduce((sum, d) => sum + (d.calculatedAmount || 0), 0), [days]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Raporlar</h1>
        <Button onClick={exportCsv}>CSV İndir</Button>
      </div>
      <Card title="Özet">
        <p className="text-lg font-bold">Toplam Tutar: ₺{totals.toFixed(2)}</p>
      </Card>
    </div>
  );
}
