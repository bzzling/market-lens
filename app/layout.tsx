import '@/app/global.css';
import { inter } from '@/app/fonts';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market Lens',
  description: 'A modern stock market simulator built specifically for investors, students, and enthusiasts.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} antialiased flex flex-col min-h-full`}>
        <Navbar />
        <main className="flex-grow pt-9">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
