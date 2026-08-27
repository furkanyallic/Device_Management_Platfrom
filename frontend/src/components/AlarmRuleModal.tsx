import React, { useState, useEffect } from 'react';
import type { AlarmRule, CreateAlarmRuleDto, UpdateAlarmRuleDto, AlarmSeverity } from '../types/alarm';
import type { Device } from '../types/device';
import { deviceService } from '../services/deviceService';
import { Modal } from './ui/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAlarmRuleDto | UpdateAlarmRuleDto) => Promise<void>;
  initialData?: AlarmRule | null;
}

const METRIC_OPTIONS = [
  'temperature',
  'humidity',
  'voltage',
  'current',
  'power',
  'frequency',
  'pressure',
  'vibration',
  'batteryLevel',
];

export const AlarmRuleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceId, setDeviceId] = useState('');
  const [metricName, setMetricName] = useState('temperature');
  const [operator, setOperator] = useState('>');
  const [threshold, setThreshold] = useState<number>(50);
  const [severity, setSeverity] = useState<AlarmSeverity>('WARNING');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const data = await deviceService.getAll();
        setDevices(data);
        if (data.length > 0 && !deviceId) {
          setDeviceId(data[0].id);
        }
      } catch (err) {
        console.error('Cihaz listesi yüklenemedi:', err);
      }
    };
    if (isOpen) {
      fetchDevices();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setDeviceId(initialData.deviceId || '');
      setMetricName(initialData.metricName || 'temperature');
      setOperator(initialData.operator || '>');
      setThreshold(initialData.threshold ?? 50);
      setSeverity(initialData.severity || 'WARNING');
      setIsActive(initialData.isActive ?? true);
    } else {
      setMetricName('temperature');
      setOperator('>');
      setThreshold(50);
      setSeverity('WARNING');
      setIsActive(true);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId || !metricName || !operator) return;

    setLoading(true);
    try {
      await onSubmit({
        deviceId,
        metricName,
        operator,
        threshold: Number(threshold),
        severity,
        isActive,
      });
      onClose();
    } catch (error) {
      console.error('Kural kaydetme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Alarm Kuralı Düzenle' : 'Yeni Alarm Kuralı'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Hedef Cihaz
          </label>
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            required
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
          >
            <option value="" disabled>
              Cihaz Seçiniz...
            </option>
            {devices.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.name} ({dev.serialNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Metrik Adı
            </label>
            <select
              value={metricName}
              onChange={(e) => setMetricName(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
            >
              {METRIC_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Operatör
            </label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none font-mono"
            >
              <option value=">">&gt; (Büyüktür)</option>
              <option value=">=">&gt;= (Büyük Eşittir)</option>
              <option value="<">&lt; (Küçüktür)</option>
              <option value="<=">&lt;= (Küçük Eşittir)</option>
              <option value="==">== (Eşittir)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Eşik Değeri (Threshold)
            </label>
            <input
              type="number"
              step="any"
              required
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Alarm Şiddeti
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as AlarmSeverity)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
            >
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-full rounded border-slate-300 text-slate-800 focus:ring-slate-500 max-w-[1rem]"
          />
          <label htmlFor="isActive" className="text-xs font-medium text-slate-700 cursor-pointer">
            Kural Aktif Olsun
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-slate-800 px-4 py-2 text-xs font-medium text-white hover:bg-slate-900 disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : initialData ? 'Güncelle' : 'Kural Oluştur'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
