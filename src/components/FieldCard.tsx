import { Link } from 'react-router-dom';
import { Field } from '../types';
import WeatherCard from './WeatherCard';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface Props {
  field: Field;
}

export default function FieldCard({ field }: Props) {
  const [lat, lng] = field.location.split(',').map((v) => parseFloat(v.trim()));
  return (
    <Card
      title={field.name}
      actions={
        <Link to={`/fields/${field.id}`}>
          <Button variant="secondary">Detay</Button>
        </Link>
      }
    >
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700 dark:text-slate-300">Tür</span>
          <span className="text-slate-900 dark:text-slate-50">{field.type}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700 dark:text-slate-300">Ücret</span>
          <span className="text-emerald-600 dark:text-emerald-400">₺{field.dailyWage}</span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{field.address}</div>
      </div>
      {lat && lng && (
        <div className="mt-3">
          <WeatherCard lat={lat} lng={lng} />
        </div>
      )}
    </Card>
  );
}
