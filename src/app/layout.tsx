import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './overrides.css';
import Footer from '@/components/Footer';
import NavBar from '@/components/Navbar';
import Script from 'next/script';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ETS Report Center',
  description: 'Now with a standardized form for IV&V vendors to make reporting easier for ETS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const classString = `${inter.className} wrapper`;
  return (
    <html lang="en">
      <head>
        <Script
          id="fouc-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `const theme = localStorage.getItem('theme') ?? 'auto';
                    if(theme === 'dark' || 
                    (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches))
                      document.documentElement.setAttribute('data-bs-theme', 'dark');`,
          }}
        />
      </head>
      <body className={classString}>
        <Providers>
          <NavBar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
