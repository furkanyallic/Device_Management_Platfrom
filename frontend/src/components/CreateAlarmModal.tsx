import React, { useState, useEffect } from 'react';
import type { CreateAlarmDto, AlarmSeverity, AlarmStatus, AlarmRule } from '../types/alarm';
import type { Device } from '../types/device';
import { deviceService } from '../services/deviceService';
import { alarmRuleService } from '../services/alarmRuleService';
import { Modal } from './ui/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAlarmDto) => Promise<void>;
}

export const CreateAlarmModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceId, setDeviceId] = useState('');
  
  const [rules, setRules] = useState<AlarmRule[]>([]);
  const [ruleId, setRuleId] = useState('');
  const [rulesLoading, setRulesLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<AlarmSeverity>('WARNING');
  const [status, setStatus] = useState<AlarmStatus>('OPEN');
  const [triggerValue, setTriggerValue] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const data = await deviceService.getAll();
        setDevices(data || []);
        if (data && data.length > 0 && !deviceId) {
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
    if (!deviceId) {
      setRules([]);
      setRuleId('');
      return;
    }
    const fetchRules = async () => {
      setRulesLoading(true);
      try {
        const deviceRules = await alarmRuleService.getByDevice(deviceId);
        setRules(deviceRules || []);
        if (deviceRules && deviceRules.length > 0) {
          setRuleId(deviceRules[0].id);
          if (deviceRules[0].severity) {
            setSeverity(deviceRules[0].severity);
          }
        } else {
          setRuleId('');
        }
      } catch (err) {
        console.error('Cihaz kuralları yüklenemedi:', err);
        setRules([]);
        setRuleId('');
      } finally {
        setRulesLoading(false);
      }
    };

    fetchRules();
  }, [deviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId || !title.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        deviceId,
        ruleId: ruleId || undefined,
        title: title.trim(),
        description: description.trim() || undefined,
        severity,
        status,
        triggerValue: triggerValue !== '' ? parseFloat(triggerValue) : undefined,
      });
      setTitle('');
      setDescription('');
      setTriggerValue('');
      onClose();
    } catch (error) {
      console.error('Alarm oluşturulurken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yeni Alarm Oluştur">
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

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
             Alarm Kuralı
          </label>
          {rulesLoading ? (
            <div className="text-xs text-slate-400 py-2">Kurallar yükleniyor...</div>
          ) : rules.length === 0 ? (
            <div className="text-xs text-amber-700 bg-amber-50 rounded px-3 py-2 border border-amber-200">
              Bu cihaza tanımlı alarm kuralı bulunmuyor.
            </div>
          ) : (
            <select
              value={ruleId}
              onChange={(e) => {
                const selectedId = e.target.value;
                setRuleId(selectedId);
                const selectedRule = rules.find((r) => r.id === selectedId);
                if (selectedRule?.severity) {
                  setSeverity(selectedRule.severity);
                }
              }}
              required
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
            >
              {rules.map((rule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.metricName} ({rule.operator} {rule.threshold}) - [{rule.severity}]
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Alarm Başlığı
          </label>
          <input
            type="text"
            required
            placeholder="Örn: Yüksek Sıcaklık Alarmı"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Açıklama (Opsiyonel)
          </label>
          <textarea
            rows={2}
            placeholder="Örn: Cihaz sıcaklığı 85°C seviyesine ulaştı."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
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

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Durum
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AlarmStatus)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
            >
              <option value="OPEN">OPEN</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Tetikleme Değeri (Trigger Value - Opsiyonel)
          </label>
          <input
            type="number"
            step="any"
            placeholder="Örn: 85.0"
            value={triggerValue}
            onChange={(e) => setTriggerValue(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none font-mono"
          />
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
            {loading ? 'Oluşturuluyor...' : 'Alarm Oluştur'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
