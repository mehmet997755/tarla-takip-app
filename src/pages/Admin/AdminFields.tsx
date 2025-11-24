import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFirestore } from '../../hooks/useFirestore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useState } from 'react';

export default function AdminFields() {
  const { user } = useAuth();
  const firestore = useFirestore(user);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin - Tarlalar</h1>
        <Link to="/add-field">
          <Button>Yeni Tarla</Button>
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {firestore.fields.map((field) => (
          <Card
            key={field.id}
            title={field.name}
            actions={
              <div className="flex gap-2">
                <Link to={`/fields/${field.id}`}>
                  <Button size="sm" variant="secondary">
                    Gör
                  </Button>
                </Link>
                <Button size="sm" variant="danger" onClick={() => setSelected(field.id)}>
                  Sil
                </Button>
              </div>
            }
          >
            <p className="text-sm text-slate-600 dark:text-slate-300">{field.address}</p>
          </Card>
        ))}
      </div>

      <Modal
        title="Tarlayı Sil"
        open={!!selected}
        onClose={() => setSelected(null)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Vazgeç
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (selected) await firestore.archiveField(selected);
                setSelected(null);
              }}
            >
              Arşivle
            </Button>
          </>
        }
      >
        <p>Bu işlem tarla listesinden kaldırır. İlgili gün kayıtlarını manuel silmeniz önerilir.</p>
      </Modal>
    </div>
  );
}
