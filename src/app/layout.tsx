import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Staff Loan Management System',
  description: 'Track and manage staff loans without interest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation */}
          <nav className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <Link href="/" className="text-xl font-bold text-gray-900">
                    Loan Manager
                  </Link>
                  <div className="hidden md:flex space-x-6">
                    <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/loans" className="text-gray-600 hover:text-gray-900 transition-colors">
                      Loans
                    </Link>
                    <Link href="/staff" className="text-gray-600 hover:text-gray-900 transition-colors">
                      Staff
                    </Link>
                    <Link href="/reports" className="text-gray-600 hover:text-gray-900 transition-colors">
                      Reports
                    </Link>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Link href="/loans/new">
                    <Button size="sm">New Loan</Button>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="min-h-screen">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
