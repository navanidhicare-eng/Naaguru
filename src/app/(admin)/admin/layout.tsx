import React from 'react';
import { redirect } from 'next/navigation';
import { getServerAdminAuthContext } from '@/shared/auth/middleware';
import { CompanyAdminSidebar } from './components/CompanyAdminSidebar';
import { CompanyAdminHeader } from './components/CompanyAdminHeader';

export default async function CompanyAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authContext = await getServerAdminAuthContext();

  if (!authContext) {
    redirect('/login');
  }

  return (
    <div className="company-admin-shell h-[100dvh] w-full flex overflow-hidden bg-brand-bg font-sans text-brand-text antialiased">
      <CompanyAdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <CompanyAdminHeader />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
