import React, { useState, useEffect } from 'react';
import type { Device, CreateDeviceDto, UpdateDeviceDto, DeviceProtocol, DeviceStatus } from '../types/device';
import { Modal } from './ui/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDeviceDto | UpdateDeviceDto) => Promise<void>;
  initialData?: Device | null;
}

export const CreateDeviceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [protocol, setProtocol] = useState<DeviceProtocol>('MQTT');
  const [status, setStatus] = useState<DeviceStatus>('ACTIVE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSerialNumber(initialData.serialNumber || '');
      setProtocol(initialData.protocol || 'MQTT');
      setStatus(initialData.status || 'ACTIVE');
    } else {
      setName('');
      setSerialNumber('');
      setProtocol('MQTT');
      setStatus('ACTIVE');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !serialNumber.trim()) return;

    setLoading(true);
    try {
      await onSubmit({ name, serialNumber, protocol, status });
      onClose();
    } catch (error) {
      console.error('Cihaz kaydedilirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Cihaz Düzenle' : 'Yeni Cihaz Kaydı'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Cihaz Adı
          </label>
          <input
            type="text"
            required
            maxLength={100}
            placeholder="Örn: Kazan Dairesi Sensörü"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Seri Numarası
          </label>
          <input
            type="text"
            required
            maxLength={100}
            placeholder="Örn: DEV-10023"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Protokol
          </label>
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value as DeviceProtocol)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
          >
            <option value="MQTT">MQTT</option>
            <option value="MODBUS_TCP">MODBUS TCP</option>
            <option value="HTTP">HTTP</option>
          </select>
        </div>

        {initialData && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Durum
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DeviceStatus)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          </div>
        )}

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
            {loading ? 'Kaydediliyor...' : initialData ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </form>
    </Modal>
  );
};