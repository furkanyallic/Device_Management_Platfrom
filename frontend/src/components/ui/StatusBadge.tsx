import React from 'react';
import type { DeviceStatus } from '../../types/device';
import type { AlarmStatus } from '../../types/alarm';

interface Props {
  status: DeviceStatus | AlarmStatus | string;
  variant?: 'device' | 'alarm';
}

export const StatusBadge: React.FC<Props> = ({ status, variant = 'device' }) => {
  const getBadgeStyle = () => {
    const uppercaseStatus = status.toUpperCase();
    if (variant === 'device') {
      switch (uppercaseStatus) {
        case 'ACTIVE':
          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'OFFLINE':
          return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'INACTIVE':
        default:
          return 'bg-slate-100 text-slate-600 border-slate-200';
      }
    } else {
      switch (uppercaseStatus) {
        case 'OPEN':
          return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'ACKNOWLEDGED':
          return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'RESOLVED':
          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        default:
          return 'bg-slate-100 text-slate-600 border-slate-200';
      }
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getBadgeStyle()}`}
    >
      {status}
    </span>
  );
};
