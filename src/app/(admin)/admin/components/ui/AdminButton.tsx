import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'minimal';

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'px-3 py-1.5 bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center gap-1.5',
  secondary: 'px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center gap-1.5',
  minimal: 'px-2.5 py-1 text-xs font-semibold bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded transition-colors flex items-center justify-center'
};

export function AdminButton({ variant = 'primary', className = '', children, ...props }: AdminButtonProps) {
  return (
    <button className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
