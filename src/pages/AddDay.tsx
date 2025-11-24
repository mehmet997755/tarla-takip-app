import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { DayType } from '../types';

export default function AddDay() {
  const { state } = useLocation();
  const { user } = useAuth();
  const firestore = useFirestore(user);
  const navigate = useNavigate();

  const [fieldId, setFieldId] = useState<string>(state?.fieldId || '');
  const [date, setDate] = useState('');
  const [dayType, setDayType] = useState<DayType>('full-day');
  const [hours, setHours] = useState(8);
  const [note, setNote] = useState('');

  const field = firestore.fields.find((f) => f.id === fieldId);
  const daily = field?.dailyWage || 0;
  const calculatedAmount = dayType === 'half-day' ? daily * 0.5 : dayType === 'custom-hours' ? daily * (hours / 8) : daily;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fieldId || !date) return;
    await firestore.addDay({
      fieldId,
      date: new Date(date),
      dayType,
      hours: dayType === 'custom-hours' ? hours : undefined,
      note,
      calculatedAmount
    });
    navigate('/fields/' + fieldId);
  };

  return (
    <Card title="Gün Ekle" className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          Tarla
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
            value={fieldId}
            onChange={(e) => setFieldId(e.target.value)}
          >
            <option value="">Seçin</option>
            {firestore.fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <Input type="date" label="Tarih" value={date} onChange={(e) => setDate(e.target.value)} required />
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          Çalışma Tipi
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
            value={dayType}
            onChange={(e) => setDayType(e.target.value as DayType)}
          >
            <option value="full-day">Tam Gün</option>
            <option value="half-day">Yarım Gün</option>
            <option value="custom-hours">Saat Bazlı</option>
          </select>
        </label>
        {dayType === 'custom-hours' && (
          <Input
            label="Saat"
            type="number"
            min={1}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
        )}
        <Input label="Not" value={note} onChange={(e) => setNote(e.target.value)} />
        <p className="text-sm text-slate-600 dark:text-slate-300">Hesaplanan Tutar: ₺{calculatedAmount.toFixed(2)}</p>
        <div className="flex justify-end">
          <Button type="submit">Kaydet</Button>
        </div>
      </form>
    </Card>
  );
}
