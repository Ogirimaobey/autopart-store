import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { MobileNav } from '../components/layout/MobileNav';

export const metadata: Metadata = {
  title: 'AutoPartPro | Genuine Vehicle Spare Parts Marketplace',
  description:
    'Buy & sell automotive spare parts in Nigeria. Direct from verified Ladipo suppliers. Search by engine code (2GR-FE, K24A), vehicle model, or OEM part number.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@600;700;800&family=Poppins:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-[#F8F9FA] text-neutral-900 min-h-screen flex flex-col antialiased selection:bg-orange-500 selection:text-white pb-16 md:pb-0">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
