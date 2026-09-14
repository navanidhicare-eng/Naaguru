import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  const [render, setRender] = useState(isOpen);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (isOpen) setRender(true);
  }, [isOpen]);

  const onTransitionEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!render) return null;

  const icons = {
    danger: <AlertTriangle className="text-red-600" size={24} />,
    warning: <AlertTriangle className="text-amber-600" size={24} />,
    info: <Info className="text-blue-600" size={24} />,
    success: <CheckCircle className="text-emerald-600" size={24} />,
  };

  const iconBgs = {
    danger: 'bg-red-100',
    warning: 'bg-amber-100',
    info: 'bg-blue-100',
    success: 'bg-emerald-100',
  };

  const confirmButtons = {
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
    info: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
      onTransitionEnd={onTransitionEnd}
    >
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => !isLoading && onCancel()}
      />

      {/* Dialog Panel */}
      <div 
        className={`relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-200 ease-out transform ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 sm:translate-y-0'}`}
      >
        <button 
          onClick={onCancel}
          disabled={isLoading}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-colors focus:outline-none"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${iconBgs[variant]}`}>
              {icons[variant]}
            </div>
            <div className="flex-1 mt-1">
              <h3 className="text-[18px] font-semibold text-gray-900 tracking-tight">{title}</h3>
              <div className="mt-2 text-[14px] text-gray-500 leading-relaxed">
                {description}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 text-[14px] font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2.5 text-[14px] font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px] ${confirmButtons[variant]}`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
