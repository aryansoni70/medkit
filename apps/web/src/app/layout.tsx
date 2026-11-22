import React from 'react';
import type { Metadata } from 'next';
import '../styles/globals.css';
import { ReactQueryProvider } from '@/context/QueryProvider';
import { AuthProvider } from '@/context/AuthContext';
import { LocationProvider } from '@/context/LocationContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'MedKit — Find Your Medicine at a Nearby Verified Pharmacy in Indore',
  description:
    'Search medicines, check live inventory availability, compare nearby licensed pharmacies across Indore and beyond, and save precious time with MedKit.',
  icons: {
    icon: '/logo.png'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-brandText-primary bg-background">
        <ReactQueryProvider>
          <AuthProvider>
            <LocationProvider>
              <div className="min-h-screen flex flex-col bg-background">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </LocationProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
