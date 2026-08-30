import React, { useEffect, useState } from 'react';
import { CheckCircle, CheckCheck, Trash2, Bell, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { alarmService } from '../services/alarmService';
import type { Alarm, AlarmStatus, CreateAlarmDto } from '../types/alarm';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Toast, type ToastType } from '../components/ui/Toast';
import { CreateAlarmModal } from '../components/CreateAlarmModal';
import { formatDateTime } from '../utils/formatters';

export const AlarmsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<AlarmStatus | 'ALL'>('ALL');

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [deletingAlarmId, setDeletingAlarmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const fetchAlarms = async () => {
    setLoading(true);
    try {
      const response = await alarmService.getAll(
        page,
        limit,
        selectedStatus === 'ALL' ? undefined : selectedStatus
      );
      setAlarms(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Alarmlar yüklenemedi:', error);
      setToast({ message: 'Alarmlar yüklenirken hata oluştu.', type: 'error' });
      setAlarms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlarms();
  }, [page, limit, selectedStatus]);

  const handleStatusFilterChange = (st: AlarmStatus | 'ALL') => {
    setSelectedStatus(st);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleCreateAlarm = async (data: CreateAlarmDto) => {
    try {
      await alarmService.create(data);
      setToast({ message: 'Yeni alarm başarıyla oluşturuldu.', type: 'success' });
      await fetchAlarms();
    } catch (error) {
      console.error('Alarm oluşturulurken hata:', error);
      setToast({ message: 'Alarm oluşturulamadı.', type: 'error' });
    }
  };

  const handleUpdateStatus = async (id: string, nextStatus: AlarmStatus) => {
    try {
      await alarmService.updateStatus(id, { status: nextStatus });
      setToast({ message: `Alarm durumu '${nextStatus}' olarak güncellendi.`, type: 'success' });
      await fetchAlarms();
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      setToast({ message: 'Alarm durumu güncellenemedi.', type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAlarmId) return;
    setDeleteLoading(true);
    try {
      await alarmService.delete(deletingAlarmId);
      setToast({ message: 'Alarm kaydı silindi.', type: 'success' });
      setDeletingAlarmId(null);
      await fetchAlarms();
    } catch (error) {
      console.error('Silme hatası:', error);
      setToast({ message: 'Alarm silinirken hata oluştu.', type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  if (loading && alarms.length === 0) {
    return <LoadingSpinner message="Alarm logları yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Üst Başlık & Filtreler & Buton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Alarm Logları</h2>
          <p className="text-xs text-slate-500">
            Sistemde tetiklenen tüm alarm kayıtları (Toplam: {total})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filtre Tab Grubu */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            {(['ALL', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => handleStatusFilterChange(st)}
                className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedStatus === st
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st === 'ALL' ? 'Tümü' : st}
              </button>
            ))}
          </div>

          {/* Yeni Alarm Butonu */}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-900 transition-colors"
          >
            <Plus size={15} />
            <span>Yeni Alarm</span>
          </button>
        </div>
      </div>

      {/* Tablo */}
      {alarms.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Alarm kaydı bulunamadı"
          description="Seçilen filtre kriterine uyan hiçbir alarm kaydı mevcut değil."
          actionLabel="Yeni Alarm Oluştur"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3">Başlık</th>
                  <th className="px-4 py-3">Cihaz ID</th>
                  <th className="px-4 py-3">Şiddet</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Tetikleme Değeri</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {alarms.map((alarm) => (
                  <tr key={alarm.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      <div>{alarm.title}</div>
                      {alarm.description && (
                        <div className="text-[11px] font-normal text-slate-400">
                          {alarm.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {alarm.deviceId ? alarm.deviceId.substring(0, 8) + '...' : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={alarm.severity} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={alarm.status} variant="alarm" />
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-700">
                      {alarm.triggerValue ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono">
                      {formatDateTime(alarm.createdAt || alarm.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {alarm.status === 'OPEN' && (
                          <button
                            onClick={() => handleUpdateStatus(alarm.id, 'ACKNOWLEDGED')}
                            className="flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                            title="Alarmı Kapat"
                          >
                            <CheckCircle size={13} />
                            <span>Alarmı Kapat</span>
                          </button>
                        )}
                        {alarm.status === 'ACKNOWLEDGED' && (
                          <button
                            onClick={() => handleUpdateStatus(alarm.id, 'RESOLVED')}
                            className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Çözüldü Olarak İşaretle"
                          >
                            <CheckCheck size={13} />
                            <span>Çözüldü</span>
                          </button>
                        )}
                        <button
                          onClick={() => setDeletingAlarmId(alarm.id)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
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

          {/* Sayfalama Alt Barı */}
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <span>
                Toplam <strong>{total}</strong> kayıttan <strong>{total > 0 ? startRecord : 0}-{endRecord}</strong> arası gösteriliyor
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Sayfa başı:</span>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">
                Sayfa {page} / {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                  title="Önceki Sayfa"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                  title="Sonraki Sayfa"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alarm Oluşturma Modalı */}
      <CreateAlarmModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateAlarm}
      />

      {/* Sil Onay Modalı */}
      <ConfirmDialog
        isOpen={!!deletingAlarmId}
        onClose={() => setDeletingAlarmId(null)}
        onConfirm={handleDeleteConfirm}
        title="Alarmı Sil"
        message="Bu alarm kaydını silmek istediğinize emin misiniz?"
        loading={deleteLoading}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};
