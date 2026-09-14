import React from 'react';

type BadgeVariant = 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'zinc';

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  rose: 'bg-rose-100 text-rose-800 border-rose-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  zinc: 'bg-zinc-100 text-zinc-700 border-zinc-200',
};

export function AdminBadge({ children, variant = 'zinc', className = '' }: AdminBadgeProps) {
  return (
    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border inline-flex items-center justify-center ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
