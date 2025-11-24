import { Link } from 'react-router-dom';
import FieldCard from '../components/FieldCard';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';

export default function Fields() {
  const { user } = useAuth();
  const { fields } = useFirestore(user);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tarlalar</h1>
          <p className="text-sm text-gray-500">Tüm kayıtlı tarlalar</p>
        </div>
        <Link to="/fields/new" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
          Yeni Tarla
        </Link>
      </div>

      <div className="space-y-3">
        {fields.map((field) => (
          <FieldCard key={field.id} field={field} />
        ))}
        {!fields.length && <div className="text-sm text-gray-500">Tarla bulunamadı.</div>}
      </div>
    </div>
  );
}
