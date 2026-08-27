import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Activity, Bell, Settings } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
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

  const fetchDeviceDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const dev = await deviceService.getById(id);
      setDevice(dev);

      const [telRes, alarmRes, ruleRes] = await Promise.allSettled([
        telemetryService.getLatestByDevice(id, 50),
        alarmService.getByDevice(id),
        alarmRuleService.getByDevice(id),
      ]);

      if (telRes.status === 'fulfilled') setTelemetry(telRes.value || []);
      if (alarmRes.status === 'fulfilled') setAlarms(alarmRes.value || []);
      if (ruleRes.status === 'fulfilled') setAlarmRules(ruleRes.value || []);
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

  // Format chart data
  const chartData = [...telemetry].reverse().map((t) => ({
    time: new Date(t.timestamp || t.createdAt).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    temperature: t.metrics?.temperature ?? null,
    humidity: t.metrics?.humidity ?? null,
    voltage: t.metrics?.voltage ?? null,
    current: t.metrics?.current ?? null,
  }));

  const latestTelemetry = telemetry[0];
  const latestMetrics = latestTelemetry?.metrics || {};

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
            <p className="mt-1 text-xs text-slate-600">
              {device.created_at ? new Date(device.created_at).toLocaleDateString('tr-TR') : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Telemetri Grafikleri & Metrik Kartları */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-500" size={18} />
            <h3 className="text-sm font-bold text-slate-800">Telemetri Verileri (Son 50 Kayıt)</h3>
          </div>
          <span className="text-[11px] text-slate-400">Canlı Metrik Takibi</span>
        </div>

        {chartData.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Bu cihaza ait telemetri verisi bulunmuyor.
          </div>
        ) : (
          <>
            {/* Metrik Kartları */}
            <div className="flex flex-wrap gap-3 pt-2">
              {Object.entries(latestMetrics).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs"
                >
                  <span className="font-medium text-slate-500 capitalize">{key}:</span>
                  <span className="font-bold text-slate-800">{String(val)}</span>
                </div>
              ))}
            </div>

            {/* Recharts Grafiği */}
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    name="Sıcaklık (°C)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    name="Nem (%)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
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
