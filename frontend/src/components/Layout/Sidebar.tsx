import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Cpu, Bell, Settings, Mail } from 'lucide-react';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/devices', label: 'Cihazlar', icon: Cpu },
  { path: '/alarms', label: 'Alarmlar', icon: Bell },
  { path: '/alarm-rules', label: 'Alarm Kuralları', icon: Settings },
  { path: '/notifications', label: 'Bildirimler', icon: Mail },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-56 flex-col justify-between border-r border-slate-200 bg-white">
      <div>
        {/* Logo / Header */}
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-white">
            <Cpu size={18} />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-800">
            IoT Panel
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 px-3 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 border-l-4 border-slate-800 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Version */}
      <div className="border-t border-slate-100 p-4 text-center">
        <span className="text-[11px] font-medium text-slate-400">
          IoT Management v1.0.0
        </span>
      </div>
    </aside>
  );
};
