import Link from 'next/link';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata = {
  title: 'IT CRM',
  description: 'CRM система для IT аутсорсинга',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="bg-gray-50 text-gray-800">
        <AuthProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Сайдбар (пока заглушка, позже вынесем в отдельный компонент) */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
              <div className="p-4 text-xl font-bold border-b border-slate-700">
                IT CRM
              </div>
              <nav className="flex-1 p-4 space-y-2">
                <Link href="/" className="block p-2 rounded hover:bg-slate-800">
                  Дашборд
                </Link>
                <Link
                  href="/tasks"
                  className="block p-2 rounded hover:bg-slate-800"
                >
                  Заявки
                </Link>
                <Link
                  href="/organizations"
                  className="block p-2 rounded hover:bg-slate-800"
                >
                  Организации
                </Link>
                <Link
                  href="/faq"
                  className="block p-2 rounded hover:bg-slate-800"
                >
                  База знаний
                </Link>
              </nav>
            </aside>

            {/* Основной контент */}
            <div className="flex-1 flex flex-col h-screen">
              {/* Шапка */}
              <header className="h-16 bg-white shadow flex items-center justify-between px-6">
                <div className="md:hidden font-bold">IT CRM</div>{' '}
                {/* Для мобилки */}
                <div className="ml-auto">
                  {/* Сюда позже добавим имя пользователя и кнопку выхода */}
                  Профиль
                </div>
              </header>

              {/* Рабочая область */}
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
