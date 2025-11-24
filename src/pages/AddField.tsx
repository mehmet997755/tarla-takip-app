import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapSelector from '../components/MapSelector';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';

export default function AddField() {
  const { user } = useAuth();
  const { addField } = useFirestore(user);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [type, setType] = useState('bugday');
  const [dailyWage, setDailyWage] = useState(0);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) return;
    if (!location) {
      setError('Lütfen haritadan konum seçin.');
      return;
    }
    if (dailyWage <= 0) {
      setError('Günlük ücret 0 veya negatif olamaz.');
      return;
    }
    const payload = {
      name,
      type,
      address: location.address,
      location: `${location.lat}, ${location.lng}`,
      dailyWage,
      userId: user.uid,
      workers: user.role === 'worker' ? [user.uid] : []
    };
    await addField(payload);
    navigate('/fields');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800"
      >
        <h1 className="text-2xl font-bold">Yeni Tarla</h1>
        <p className="text-sm text-gray-500">Tarla bilgilerini doldurun</p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium">İsim</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tür</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="bugday">Buğday</option>
              <option value="aycicek">Ayçiçek</option>
              <option value="misir">Mısır</option>
              <option value="diger">Diğer</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Günlük Ücret (₺)</label>
            <input
              type="number"
              min={1}
              value={dailyWage}
              onChange={(e) => setDailyWage(Number(e.target.value))}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700"
          >
            Kaydet
          </button>
        </div>
      </form>
      <div className="space-y-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
          <h3 className="text-lg font-semibold">Konum Seç</h3>
          <p className="text-sm text-gray-500">Haritaya tıklayarak adres seçin</p>
          <div className="mt-3">
            <MapSelector value={location || undefined} onChange={(data) => setLocation(data)} />
          </div>
          {location && <div className="mt-2 text-sm text-gray-600">Adres: {location.address}</div>}
        </div>
      </div>
    </div>
  );
}
