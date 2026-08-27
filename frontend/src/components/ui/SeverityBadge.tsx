import React from 'react';
import type { AlarmSeverity } from '../../types/alarm';

interface Props {
  severity: AlarmSeverity | string;
}

export const SeverityBadge: React.FC<Props> = ({ severity }) => {
  const getStyle = () => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'WARNING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'INFO':
      default:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStyle()}`}>
      {severity}
    </span>
  );
};
