import { Link } from 'react-router-dom';
import { Field } from '../types';
import WeatherCard from './WeatherCard';

interface Props {
  field: Field;
}

export default function FieldCard({ field }: Props) {
  const [lat, lng] = field.location.split(',').map((v) => parseFloat(v.trim()));
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{field.name}</h3>
          <p className="text-sm text-gray-500">{field.address}</p>
          <p className="mt-2 text-sm">Tür: {field.type}</p>
          <p className="text-sm">Günlük Ücret: ₺{field.dailyWage}</p>
          <p className="text-sm">İşçi Sayısı: {field.workers?.length || 0}</p>
        </div>
        <WeatherCard lat={lat} lng={lng} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Link
          to={`/fields/${field.id}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Detaylara Git →
        </Link>
      </div>
    </div>
  );
}
