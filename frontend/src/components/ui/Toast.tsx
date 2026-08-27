import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Props {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<Props> = ({
  message,
  type = 'info',
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle2,
          style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          iconStyle: 'text-emerald-600',
        };
      case 'error':
        return {
          icon: AlertCircle,
          style: 'bg-rose-50 text-rose-800 border-rose-200',
          iconStyle: 'text-rose-600',
        };
      case 'info':
      default:
        return {
          icon: Info,
          style: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          iconStyle: 'text-indigo-600',
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all ${config.style}`}
    >
      <IconComponent size={20} className={config.iconStyle} />
      <span className="text-xs font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600">
        <X size={16} />
      </button>
    </div>
  );
};
