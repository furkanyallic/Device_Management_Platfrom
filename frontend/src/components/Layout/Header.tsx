import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard Özet',
  '/devices': 'Cihaz Yönetimi',
  '/alarms': 'Alarm Logları',
  '/alarm-rules': 'Alarm Kuralları',
  '/notifications': 'Bildirim Geçmişi',
};

export const Header: React.FC = () => {
  const location = useLocation();
  
  let title = routeTitles[location.pathname];
  if (!title && location.pathname.startsWith('/devices/')) {
    title = 'Cihaz Detayı';
  }
  if (!title) {
    title = 'IoT Yönetim Paneli';
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md">
      <h1 className="text-base font-bold tracking-tight text-slate-800">
        {title}
      </h1>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title="Bildirimler"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </button>
      </div>
    </header>
  );
};
