import { FormEvent, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';

export default function AddDay() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { fields, addDay } = useFirestore(user);
  const navigate = useNavigate();
  const field = useMemo(() => fields.find((f) => f.id === id), [fields, id]);

  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    await addDay({ fieldId: id, date, note });
    navigate(`/fields/${id}`);
  };

  if (!field) return <div>Tarla bulunamadı.</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800"
      >
        <h1 className="text-2xl font-bold">Gün Ekle</h1>
        <p className="text-sm text-gray-500">{field.name} için yeni gün</p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Tarih</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Not</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700"
          >
            Kaydet
          </button>
        </div>
      </form>
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
        <h3 className="text-lg font-semibold">Ödeme</h3>
        <p className="text-sm text-gray-500">Günlük ücret: ₺{field.dailyWage}</p>
        <p className="text-sm text-gray-500">Kazanç: ₺{field.dailyWage}</p>
      </div>
    </div>
  );
}
