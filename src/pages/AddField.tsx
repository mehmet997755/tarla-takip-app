import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapSelector from '../components/MapSelector';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export default function AddField() {
  const { user } = useAuth();
  const firestore = useFirestore(user);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [dailyWage, setDailyWage] = useState<number>(0);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string }>({ lat: 0, lng: 0, address: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !type || !location.address || dailyWage <= 0) {
      setError('Lütfen tüm alanları doldurun ve ücretin sıfırdan büyük olduğuna emin olun.');
      return;
    }
    if (!user) return;
    await firestore.addField({
      name,
      type,
      dailyWage,
      location: `${location.lat}, ${location.lng}`,
      address: location.address,
      userId: user.uid,
      workers: user.role === 'worker' ? [user.uid] : [],
      status: 'active'
    });
    navigate('/fields');
  };

  return (
    <Card title="Tarla Oluştur" className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="İsim" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Ürün Türü" value={type} onChange={(e) => setType(e.target.value)} required />
        </div>
        <Input
          label="Günlük Ücret"
          type="number"
          min={1}
          value={dailyWage}
          onChange={(e) => setDailyWage(Number(e.target.value))}
          required
        />
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Konum Seç</p>
          <MapSelector
            lat={location.lat}
            lng={location.lng}
            onSelect={(loc) => setLocation({ lat: loc.lat, lng: loc.lng, address: loc.fullAddress })}
          />
          <p className="text-xs text-slate-500">Adres: {location.address || 'Seçilmedi'}</p>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end">
          <Button type="submit">Kaydet</Button>
        </div>
      </form>
    </Card>
  );
}
