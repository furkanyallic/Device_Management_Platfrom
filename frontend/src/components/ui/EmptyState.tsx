import React from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<Props> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center">
      <Icon className="mx-auto mb-3 text-slate-300" size={36} />
      <h4 className="text-sm font-medium text-slate-700">{title}</h4>
      {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 rounded bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-900 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
