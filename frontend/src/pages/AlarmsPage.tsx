import React, { useEffect, useState } from 'react';
import { CheckCircle, CheckCheck, Trash2, Bell } from 'lucide-react';
import { alarmService } from '../services/alarmService';
import type { Alarm, AlarmStatus } from '../types/alarm';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Toast, type ToastType } from '../components/ui/Toast';

export const AlarmsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<AlarmStatus | 'ALL'>('ALL');

  const [deletingAlarmId, setDeletingAlarmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const fetchAlarms = async () => {
    setLoading(true);
    try {
      const data = await alarmService.getAll(
        selectedStatus === 'ALL' ? undefined : selectedStatus
      );
      setAlarms(data);
    } catch (error) {
      console.error('Alarmlar yüklenemedi:', error);
      setToast({ message: 'Alarmlar yüklenirken hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlarms();
  }, [selectedStatus]);

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

  if (loading) {
    return <LoadingSpinner message="Alarm logları yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Üst Başlık & Filtreler */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Alarm Logları</h2>
          <p className="text-xs text-slate-500">Sistemde tetiklenen tüm alarm kayıtları</p>
        </div>

        {/* Filtre Tab Grubu */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {(['ALL', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
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
      </div>

      {/* Tablo */}
      {alarms.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Alarm kaydı bulunamadı"
          description="Seçilen filtre kriterine uyan hiçbir alarm kaydı mevcut değil."
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
                    <td className="px-4 py-3 text-slate-400">
                      {alarm.created_at ? new Date(alarm.created_at).toLocaleString('tr-TR') : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {alarm.status === 'OPEN' && (
                          <button
                            onClick={() => handleUpdateStatus(alarm.id, 'ACKNOWLEDGED')}
                            className="flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                            title="Onayla"
                          >
                            <CheckCircle size={13} />
                            <span>Onayla</span>
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
        </div>
      )}

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
