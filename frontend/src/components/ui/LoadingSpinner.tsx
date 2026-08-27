import React from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  message?: string;
}

export const LoadingSpinner: React.FC<Props> = ({ message = 'Yükleniyor...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <Loader2 className="animate-spin mb-2" size={28} />
      <span className="text-xs font-medium">{message}</span>
    </div>
  );
};