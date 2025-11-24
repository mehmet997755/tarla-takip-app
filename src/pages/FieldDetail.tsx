import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import WeatherCard from '../components/WeatherCard';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function FieldDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { fields, days, deleteDay } = useFirestore(user);

  const field = useMemo(() => fields.find((f) => f.id === id), [fields, id]);
  const fieldDays = useMemo(() => days.filter((d) => d.fieldId === id), [days, id]);

  if (!field) return <div>Tarla bulunamadı.</div>;

  const [lat, lng] = field.location.split(',').map((v) => parseFloat(v.trim()));
  const totalEarnings = fieldDays.length * field.dailyWage;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{field.name}</h1>
          <p className="text-sm text-gray-500">{field.address}</p>
        </div>
        <Link
          to={`/fields/${field.id}/add-day`}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
        >
          Gün Ekle
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
          <h3 className="text-lg font-semibold">Özet</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div>Tür: {field.type}</div>
            <div>Günlük Ücret: ₺{field.dailyWage}</div>
            <div>İşçi Sayısı: {field.workers?.length || 0}</div>
            <div>Toplam Gün: {fieldDays.length}</div>
            <div>Kazanç: ₺{totalEarnings}</div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
          <h3 className="text-lg font-semibold">Hava Durumu</h3>
          <div className="mt-3">
            <WeatherCard lat={lat} lng={lng} />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
          <h3 className="text-lg font-semibold">Konum</h3>
          <p className="text-sm text-gray-500">{field.address}</p>
          <div className="mt-3 overflow-hidden rounded-lg">
            <MapContainer center={{ lat, lng }} zoom={13} scrollWheelZoom className="h-48">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              <Marker position={{ lat, lng }} icon={markerIcon} />
            </MapContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
        <h3 className="text-lg font-semibold">Günlük Kayıtlar</h3>
        <div className="mt-3 space-y-2 text-sm">
          {fieldDays.map((day) => (
            <div key={day.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
              <div>
                <div className="font-semibold">{new Date(day.date).toLocaleDateString('tr-TR')}</div>
                <div className="text-gray-500">{day.note}</div>
              </div>
              {user?.role === 'employer' && (
                <button
                  onClick={() => deleteDay(day.id)}
                  className="rounded-md bg-red-500 px-3 py-1 text-xs text-white"
                >
                  Sil
                </button>
              )}
            </div>
          ))}
          {!fieldDays.length && <div className="text-gray-500">Henüz kayıt yok.</div>}
        </div>
      </div>
    </div>
  );
}
