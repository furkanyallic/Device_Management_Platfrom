import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, Cpu } from 'lucide-react';
import { deviceService } from '../services/deviceService';
import type { Device, CreateDeviceDto, UpdateDeviceDto } from '../types/device';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CreateDeviceModal } from '../components/CreateDeviceModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Toast, type ToastType } from '../components/ui/Toast';

export const DevicesPage: React.FC = () => {
  
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  
  const [deletingDeviceId, setDeletingDeviceId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await deviceService.getAll();
      setDevices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Cihazlar alınamadı:', error);
      setToast({ message: 'Cihazlar yüklenirken hata oluştu.', type: 'error' });
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingDevice(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (device: Device) => {
    setEditingDevice(device);
    setModalOpen(true);
  };

  const handleSubmitDevice = async (data: CreateDeviceDto | UpdateDeviceDto) => {
    try {
      if (editingDevice) {
        await deviceService.update(editingDevice.id, data);
        setToast({ message: 'Cihaz başarıyla güncellendi.', type: 'success' });
      } else {
        await deviceService.create(data as CreateDeviceDto);
        setToast({ message: 'Yeni cihaz eklendi.', type: 'success' });
      }
      await fetchDevices();
    } catch (error) {
      console.error('Cihaz kaydetme hatası:', error);
      setToast({ message: 'İşlem başarısız oldu.', type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDeviceId) return;
    setDeleteLoading(true);
    try {
      await deviceService.delete(deletingDeviceId);
      setToast({ message: 'Cihaz silindi.', type: 'success' });
      setDeletingDeviceId(null);
      await fetchDevices();
    } catch (error) {
      console.error('Silme hatası:', error);
      setToast({ message: 'Cihaz silinirken hata oluştu.', type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cihaz listesi yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Üst Alan */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Cihaz Yönetimi</h2>
          <p className="text-xs text-slate-500">Sistemde tanımlı olan tüm IoT cihazlarının listesi</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 rounded-md bg-slate-800 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-900 transition-colors"
        >
          <Plus size={16} />
          <span>Yeni Cihaz</span>
        </button>
      </div>

      {/* Tablo Alanı */}
      {devices.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title="Henüz kayıtlı bir cihaz bulunamadı"
          description="Sisteme ilk cihazınızı eklemek için 'Yeni Cihaz' butonunu kullanabilirsiniz."
          actionLabel="Yeni Cihaz Ekle"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3">Cihaz Adı</th>
                  <th className="px-4 py-3">Seri No</th>
                  <th className="px-4 py-3">Protokol</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Oluşturulma</th>
                  <th className="px-4 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{device.name}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      {device.serialNumber}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {device.protocol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={device.status} variant="device" />
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {device.created_at ? new Date(device.created_at).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/devices/${device.id}`)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="Detay Göster"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(device)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          title="Düzenle"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingDeviceId(device.id)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modallar */}
      <CreateDeviceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitDevice}
        initialData={editingDevice}
      />

      <ConfirmDialog
        isOpen={!!deletingDeviceId}
        onClose={() => setDeletingDeviceId(null)}
        onConfirm={handleDeleteConfirm}
        title="Cihazı Sil"
        message="Bu cihazı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        loading={deleteLoading}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
