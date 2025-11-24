import { Link } from 'react-router-dom';
import FieldCard from '../components/FieldCard';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { Button } from '../components/ui/Button';

export default function Fields() {
  const { user } = useAuth();
  const { fields } = useFirestore(user);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Tarlalar</h1>
        <Link to="/add-field">
          <Button>Yeni Tarla</Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <FieldCard key={field.id} field={field} />
        ))}
        {!fields.length && <p className="text-sm text-slate-500">Henüz kayıt yok.</p>}
      </div>
    </div>
  );
}
