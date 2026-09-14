import React from 'react';

export function AdminCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-zinc-200 rounded-lg shadow-card ${className}`}>
      {children}
    </div>
  );
}
