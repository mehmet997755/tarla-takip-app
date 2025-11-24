import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await resetPassword(email);
    setMessage('Şifre sıfırlama bağlantısı gönderildi.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <h1 className="text-2xl font-bold">Şifreyi Sıfırla</h1>
        <p className="text-sm text-gray-500">E-posta adresinizi girin</p>

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
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700"
          >
            Gönder
          </button>
          {message && <div className="text-sm text-green-600">{message}</div>}
        </form>

        <div className="mt-4 text-sm text-indigo-600">
          <Link to="/login">Girişe dön</Link>
        </div>
      </div>
    </div>
  );
}
