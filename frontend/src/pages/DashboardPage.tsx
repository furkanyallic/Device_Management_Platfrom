import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Activity, AlertTriangle, Mail, ArrowRight } from 'lucide-react';
import { deviceService } from '../services/deviceService';
import { alarmService } from '../services/alarmService';
import { notificationService } from '../services/notificationService';
import type { Device } from '../types/device';
import type { Alarm } from '../types/alarm';
import type { Notification } from '../types/notification';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatDateTime } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [recentAlarms, setRecentAlarms] = useState<Alarm[]>([]);
  const [openAlarmsCount, setOpenAlarmsCount] = useState<number>(0);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [totalNotifications, setTotalNotifications] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [devRes, alarmRes, openAlarmRes, notifRes] = await Promise.allSettled([
          deviceService.getAll(),
          alarmService.getAll(1, 5),
          alarmService.getAll(1, 1, 'OPEN'),
          notificationService.getAll(1, 5),
        ]);

        if (devRes.status === 'fulfilled') setDevices(Array.isArray(devRes.value) ? devRes.value : []);
        if (alarmRes.status === 'fulfilled') setRecentAlarms(alarmRes.value?.data || []);
        if (openAlarmRes.status === 'fulfilled') setOpenAlarmsCount(openAlarmRes.value?.total || 0);
        if (notifRes.status === 'fulfilled') {
          setRecentNotifications(notifRes.value?.data || []);
          setTotalNotifications(notifRes.value?.total || 0);
        }
      } catch (error) {
        console.error('Dashboard verisi yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalDevices = devices.length;
  const activeDevices = devices.filter((d) => d.status === 'ACTIVE').length;

  if (loading) {
    return <LoadingSpinner message="Dashboard verileri yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* 4 Özet Kartı */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Toplam Cihaz */}
        <div className="flex justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-500">Toplam Cihaz</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-800">{totalDevices}</h3>
            <p className="mt-1 text-[11px] text-slate-400">Kayıtlı tüm sistem cihazları</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Cpu size={20} />
          </div>
        </div>

        {/* Aktif Cihaz */}
        <div className="flex justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-500">Aktif Cihaz</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-800">{activeDevices}</h3>
            <p className="mt-1 text-[11px] text-slate-400">Çalışır durumdaki cihazlar</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Activity size={20} />
          </div>
        </div>

        {/* Açık Alarm */}
        <div className="flex justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-500">Açık Alarmlar</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-800">{openAlarmsCount}</h3>
            <p className="mt-1 text-[11px] text-slate-400">Müdahale bekleyen alarmlar</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <AlertTriangle size={20} />
          </div>
        </div>

        {/* Bildirim */}
        <div className="flex justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-500">Bildirimler</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-800">{totalNotifications}</h3>
            <p className="mt-1 text-[11px] text-slate-400">Gönderilen bildirimler</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Mail size={20} />
          </div>
        </div>
      </div>

      {/* 2 Sütunlu Bölüm */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sol Sütun (~60%): Son Alarmlar */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Son Alarmlar</h3>
            <Link
              to="/alarms"
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              <span>Tümünü Gör</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentAlarms.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Kayıtlı alarm bulunmuyor.</div>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="py-2 font-medium">Başlık</th>
                    <th className="py-2 font-medium">Cihaz ID</th>
                    <th className="py-2 font-medium">Şiddet</th>
                    <th className="py-2 font-medium">Durum</th>
                    <th className="py-2 font-medium">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {recentAlarms.map((alarm) => (
                    <tr key={alarm.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 font-medium text-slate-800">{alarm.title}</td>
                      <td className="py-2.5 font-mono text-[11px] text-slate-500">
                        {alarm.deviceId ? alarm.deviceId.substring(0, 8) + '...' : '-'}
                      </td>
                      <td className="py-2.5">
                        <SeverityBadge severity={alarm.severity} />
                      </td>
                      <td className="py-2.5">
                        <StatusBadge status={alarm.status} variant="alarm" />
                      </td>
                      <td className="py-2.5 text-[11px] text-slate-400 font-mono">
                        {formatDateTime(alarm.createdAt || alarm.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sağ Sütun (~40%): Son Bildirimler */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Son Bildirimler</h3>
            <Link
              to="/notifications"
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              <span>Tümünü Gör</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentNotifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Bildirim bulunmuyor.</div>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {recentNotifications.map((notif) => (
                <div key={notif.id} className="py-2.5 flex items-start justify-between gap-2">
                  <div className="space-y-0.5 max-w-[70%]">
                    <p className="text-xs font-medium text-slate-800 truncate">{notif.subject}</p>
                    <p className="text-[11px] text-slate-400">{notif.recipient_email}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold ${
                        notif.status === 'SENT'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {notif.status}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {formatDateTime(notif.sent_at || notif.sentAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
