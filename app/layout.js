import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata = {
  title: 'IT CRM',
  description: 'CRM система для IT аутсорсинга',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
