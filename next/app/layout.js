import { Mona_Sans } from 'next/font/google';
import './styles/globals.css';
import { NotificationProvider } from '@/app/context/NotificationContext';

const font = Mona_Sans({
  variable: '--font',
  subsets: ['latin'],
});

export const metadata = {
  title: 'GitTown',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${font.variable} antialiased`}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
