import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmail(email, password);
      navigate('/');
    } catch (err) {
      setError('Giriş başarısız. Bilgileri kontrol edin.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <h1 className="text-2xl font-bold">Giriş</h1>
        <p className="text-sm text-gray-500">Tarla Takip hesabınıza giriş yapın</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700"
          >
            Giriş Yap
          </button>
        </form>

        <button
          onClick={async () => {
            try {
              await signInWithGoogle();
              navigate('/');
            } catch (err) {
              setError('Google ile giriş yapılamadı.');
            }
          }}
          className="mt-3 w-full rounded-lg border border-gray-300 py-2 font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          Google ile Giriş Yap
        </button>

        <div className="mt-4 flex justify-between text-sm text-indigo-600">
          <Link to="/signup">Hesap oluştur</Link>
          <Link to="/forgot">Şifremi unuttum</Link>
        </div>
      </div>
    </div>
  );
}
