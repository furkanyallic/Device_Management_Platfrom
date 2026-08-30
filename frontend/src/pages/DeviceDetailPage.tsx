import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Activity, Bell, Settings } from 'lucide-react';
import { deviceService } from '../services/deviceService';
import { telemetryService } from '../services/telemetryService';
import { alarmService } from '../services/alarmService';
import { alarmRuleService } from '../services/alarmRuleService';
import type { Device, CreateDeviceDto, UpdateDeviceDto } from '../types/device';
import type { TelemetryRecord } from '../types/telemetry';
import type { Alarm, AlarmRule } from '../types/alarm';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { CreateDeviceModal } from '../components/CreateDeviceModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Toast, type ToastType } from '../components/ui/Toast';
import { formatDateTime } from '../utils/formatters';

export const DeviceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [device, setDevice] = useState<Device | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryRecord[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [alarmRules, setAlarmRules] = useState<AlarmRule[]>([]);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const fetchTelemetry = async () => {
    if (!id) return;
    try {
      const telData = await telemetryService.getLatestByDevice(id, 50);
      const sorted = [...(telData || [])].sort((a, b) => {
        const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
        const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setTelemetry(sorted);
    } catch (err) {
      console.error('Telemetri verisi güncellenemedi:', err);
    }
  };

  const fetchDeviceDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const dev = await deviceService.getById(id);
      setDevice(dev);

      const [alarmRes, ruleRes] = await Promise.allSettled([
        alarmService.getByDevice(id),
        alarmRuleService.getByDevice(id),
      ]);

      if (alarmRes.status === 'fulfilled') setAlarms(alarmRes.value || []);
      if (ruleRes.status === 'fulfilled') setAlarmRules(ruleRes.value || []);

      await fetchTelemetry();
    } catch (error) {
      console.error('Cihaz detayları yüklenemedi:', error);
      setToast({ message: 'Cihaz detayları alınamadı.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceDetails();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const handleUpdateDevice = async (data: CreateDeviceDto | UpdateDeviceDto) => {
    if (!id) return;
    try {
      const updated = await deviceService.update(id, data);
      setDevice(updated);
      setToast({ message: 'Cihaz güncellendi.', type: 'success' });
      setModalOpen(false);
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      setToast({ message: 'Güncelleme başarısız.', type: 'error' });
    }
  };

  const handleDeleteDevice = async () => {
    if (!id) return;
    setDeleteLoading(true);
    try {
      await deviceService.delete(id);
      setToast({ message: 'Cihaz silindi.', type: 'success' });
      navigate('/devices');
    } catch (error) {
      console.error('Silme hatası:', error);
      setToast({ message: 'Cihaz silinemedi.', type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Tüm telemetri kayıtlarından benzersiz metrik isimlerini toplayalım
  const metricKeys = Array.from(
    new Set(
      telemetry.flatMap((t) => (t.metrics ? Object.keys(t.metrics) : []))
    )
  );

  const formatMetricHeader = (key: string): string => {
    const map: Record<string, string> = {
      temperature: 'Sıcaklık (°C)',
      humidity: 'Nem (%)',
      voltage: 'Voltaj (V)',
      current: 'Akım (A)',
      pressure: 'Basınç (bar)',
      battery: 'Batarya (%)',
      speed: 'Hız (km/h)',
    };
    return map[key.toLowerCase()] || key;
  };

  if (loading) {
    return <LoadingSpinner message="Cihaz detayları yükleniyor..." />;
  }

  if (!device) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p className="text-sm">Cihaz bulunamadı.</p>
        <Link to="/devices" className="mt-2 text-xs font-semibold text-blue-600 hover:underline">
          Cihaz listesine dön
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Üst Navigasyon & Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/devices')}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">{device.name}</h2>
            <p className="text-xs font-mono text-slate-400">ID: {device.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={14} />
            <span>Düzenle</span>
          </button>
          <button
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center gap-1.5 rounded border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100"
          >
            <Trash2 size={14} />
            <span>Sil</span>
          </button>
        </div>
      </div>

      {/* Cihaz Özet Kartı */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Seri Numarası</p>
            <p className="mt-1 font-mono text-xs font-bold text-slate-800">{device.serialNumber}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Protokol</p>
            <p className="mt-1 text-xs font-semibold text-slate-700">{device.protocol}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Durum</p>
            <div className="mt-1">
              <StatusBadge status={device.status} variant="device" />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Oluşturulma Tarihi</p>
            <p className="mt-1 text-xs text-slate-600 font-mono">
              {formatDateTime(device.created_at || device.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Telemetri Kayıtları Tablosu (Sütun Bazlı Görünüm) */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-500" size={18} />
            <h3 className="text-sm font-bold text-slate-800">Telemetri Kayıtları (Son 50 Kayıt)</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-700">Canlı Veri Akışı</span>
          </div>
        </div>

        {telemetry.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Bu cihaza ait telemetri kaydı bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3 whitespace-nowrap">Tarih / Saat</th>
                  {metricKeys.map((key) => (
                    <th key={key} className="px-4 py-3 whitespace-nowrap">
                      {formatMetricHeader(key)}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right whitespace-nowrap">Kayıt ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {telemetry.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-800 font-medium whitespace-nowrap">
                      {formatDateTime(t.timestamp || t.createdAt)}
                    </td>
                    {metricKeys.map((key) => {
                      const val = t.metrics ? t.metrics[key] : undefined;
                      return (
                        <td key={key} className="px-4 py-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                          {val !== undefined && val !== null ? String(val) : '-'}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400 text-right whitespace-nowrap">
                      {t.id ? t.id.substring(0, 8) + '...' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alt Bölüm: Cihaz Alarmları & Alarm Kuralları */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cihaz Alarmları */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="text-amber-500" size={18} />
            <h3 className="text-sm font-bold text-slate-800">Cihaz Alarmları</h3>
          </div>
          {alarms.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Alarm bulunmuyor.</div>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="py-2 font-medium">Başlık</th>
                    <th className="py-2 font-medium">Şiddet</th>
                    <th className="py-2 font-medium">Durum</th>
                    <th className="py-2 font-medium">Değer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {alarms.map((alarm) => (
                    <tr key={alarm.id}>
                      <td className="py-2 font-medium">{alarm.title}</td>
                      <td className="py-2">
                        <SeverityBadge severity={alarm.severity} />
                      </td>
                      <td className="py-2">
                        <StatusBadge status={alarm.status} variant="alarm" />
                      </td>
                      <td className="py-2 text-[11px] font-mono text-slate-500">
                        {alarm.triggerValue ?? '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cihaz Alarm Kuralları */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings className="text-indigo-500" size={18} />
            <h3 className="text-sm font-bold text-slate-800">Tanımlı Alarm Kuralları</h3>
          </div>
          {alarmRules.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Tanımlı kural bulunmuyor.</div>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="py-2 font-medium">Metrik</th>
                    <th className="py-2 font-medium">Operatör</th>
                    <th className="py-2 font-medium">Eşik</th>
                    <th className="py-2 font-medium">Şiddet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {alarmRules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="py-2 font-mono font-medium">{rule.metricName}</td>
                      <td className="py-2 font-mono">{rule.operator}</td>
                      <td className="py-2 font-mono">{rule.threshold}</td>
                      <td className="py-2">
                        <SeverityBadge severity={rule.severity} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modallar */}
      <CreateDeviceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleUpdateDevice}
        initialData={device}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteDevice}
        title="Cihazı Sil"
        message="Bu cihazı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        loading={deleteLoading}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};
