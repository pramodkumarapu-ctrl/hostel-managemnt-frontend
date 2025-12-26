import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Hostel Management',
  description: 'Hostel Management System',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 min-h-screen flex items-center justify-center font-sans">
        <div className="w-full max-w-7xl mx-auto px-4">
          {children}
        </div>
      </body>
    </html>
  );
}
