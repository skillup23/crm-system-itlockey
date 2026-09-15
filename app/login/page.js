'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { status } = useSession();

  // Если сессия уже активна — перекидываем в систему
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white text-sm">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">IT CRM</h1>
          <p className="text-slate-500 mt-2">Войдите в систему управления</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all"
              required
              placeholder="admin@itlockey.ru"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all"
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 px-4 font-semibold text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all mt-4"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
