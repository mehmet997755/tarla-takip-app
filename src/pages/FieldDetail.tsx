import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import WeatherCard from '../components/WeatherCard';
import MapSelector from '../components/MapSelector';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import WorkerList from '../components/WorkerList';
import { DayType, Field } from '../types';

export default function FieldDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const firestore = useFirestore(user);
  const navigate = useNavigate();
  const [field, setField] = useState<Field | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [dayForm, setDayForm] = useState({
    date: '',
    workerId: '',
    dayType: 'full-day' as DayType,
    hours: 8,
    note: ''
  });

  useEffect(() => {
    const current = firestore.fields.find((f) => f.id === id);
    if (current) setField(current);
  }, [firestore.fields, id]);

  const fieldDays = useMemo(() => firestore.days.filter((d) => d.fieldId === id), [firestore.days, id]);

  const handleAddDay = async () => {
    if (!field || !id) return;
    const daily = Number(field.dailyWage) || 0;
    let amount = daily;
    if (dayForm.dayType === 'half-day') amount = daily * 0.5;
    if (dayForm.dayType === 'custom-hours') amount = daily * (Number(dayForm.hours) / 8);
    await firestore.addDay({
      fieldId: id,
      workerId: dayForm.workerId || undefined,
      dayType: dayForm.dayType,
      hours: dayForm.dayType === 'custom-hours' ? Number(dayForm.hours) : undefined,
      note: dayForm.note,
      date: new Date(dayForm.date),
      calculatedAmount: amount
    });
    setDayForm({ date: '', workerId: '', dayType: 'full-day', hours: 8, note: '' });
    firestore.loadDays(id);
  };

  const handleDeleteDay = async (dayId: string) => {
    await firestore.deleteDay(dayId);
    firestore.loadDays(id);
  };

  const handleArchive = async () => {
    if (!id) return;
    await firestore.archiveField(id);
    navigate('/fields');
  };

  if (!field) return <p className="text-sm text-slate-500">Tarla bulunamadı.</p>;

  const [lat, lng] = field.location.split(',').map((v) => parseFloat(v.trim()));
  const isAdmin = user?.role === 'admin' || user?.role === 'owner' || user?.uid === field.userId;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{field.name}</h1>
          <p className="text-sm text-slate-500">{field.address}</p>
        </div>
        {isAdmin && (
          <Button variant="danger" onClick={() => setShowDelete(true)}>
            Tarla Sil
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Özet" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-slate-500">Günlük Ücret</p>
              <p className="text-2xl font-bold text-emerald-500">₺{field.dailyWage}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Toplam Gün</p>
              <p className="text-2xl font-bold">{fieldDays.length}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Toplam Kazanç</p>
              <p className="text-2xl font-bold">₺{fieldDays.reduce((s, d) => s + (d.calculatedAmount || 0), 0).toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card title="Hava">
          <WeatherCard lat={lat} lng={lng} />
        </Card>
      </div>

      <Card title="Gün Ekle">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <Input type="date" label="Tarih" value={dayForm.date} onChange={(e) => setDayForm((p) => ({ ...p, date: e.target.value }))} />
          <Input label="Not" value={dayForm.note} onChange={(e) => setDayForm((p) => ({ ...p, note: e.target.value }))} />
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            Çalışan ID (opsiyonel)
            <input
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
              value={dayForm.workerId}
              onChange={(e) => setDayForm((p) => ({ ...p, workerId: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            Çalışma Tipi
            <select
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
              value={dayForm.dayType}
              onChange={(e) => setDayForm((p) => ({ ...p, dayType: e.target.value as DayType }))}
            >
              <option value="full-day">Tam Gün</option>
              <option value="half-day">Yarım Gün</option>
              <option value="custom-hours">Saat Bazlı</option>
            </select>
          </label>
          {dayForm.dayType === 'custom-hours' && (
            <Input
              label="Saat"
              type="number"
              min={1}
              value={dayForm.hours}
              onChange={(e) => setDayForm((p) => ({ ...p, hours: Number(e.target.value) }))}
            />
          )}
          <div className="flex items-end">
            <Button type="button" onClick={handleAddDay} disabled={!dayForm.date}>
              Gün Ekle
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Gün Listesi">
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-3 py-2">Tarih</th>
                <th className="px-3 py-2">Çalışan</th>
                <th className="px-3 py-2">Tip</th>
                <th className="px-3 py-2">Saat</th>
                <th className="px-3 py-2">Tutar</th>
                <th className="px-3 py-2">Not</th>
                {isAdmin && <th className="px-3 py-2 text-right">İşlem</th>}
              </tr>
            </thead>
            <tbody>
              {fieldDays.map((d) => (
                <tr key={d.id} className="border-b border-slate-100 text-slate-700 dark:border-slate-800 dark:text-slate-200">
                  <td className="px-3 py-2">{new Date(d.date.seconds ? d.date.seconds * 1000 : d.date).toLocaleDateString('tr-TR')}</td>
                  <td className="px-3 py-2">{d.workerId || '-'}</td>
                  <td className="px-3 py-2">{d.dayType}</td>
                  <td className="px-3 py-2">{d.hours || '-'}</td>
                  <td className="px-3 py-2">₺{d.calculatedAmount.toFixed(2)}</td>
                  <td className="px-3 py-2">{d.note || '-'}</td>
                  {isAdmin && (
                    <td className="px-3 py-2 text-right">
                      <Button variant="danger" size="sm" onClick={() => handleDeleteDay(d.id)}>
                        Sil
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
              {!fieldDays.length && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    Kayıt yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Çalışanlar">
        <WorkerList fieldId={id!} />
      </Card>

      <Card title="Harita Güncelle" className="space-y-2">
        <MapSelector
          lat={lat}
          lng={lng}
          onSelect={(loc) =>
            setField((prev) =>
              prev
                ? { ...prev, location: `${loc.lat}, ${loc.lng}`, address: loc.fullAddress }
                : prev
            )
          }
        />
        <p className="text-xs text-slate-500">Adres: {field.address}</p>
      </Card>

      <Modal
        title="Tarlayı Sil"
        open={showDelete}
        onClose={() => setShowDelete(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowDelete(false)}>
              Vazgeç
            </Button>
            <Button variant="danger" onClick={handleArchive}>
              Evet, Sil
            </Button>
          </>
        }
      >
        <p>Bu işlemle tarla arşivlenecek ve listeden kaldırılacaktır.</p>
      </Modal>
    </div>
  );
}
