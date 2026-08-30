import React, { useEffect, useState } from 'react';
import { Mail, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types/notification';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatDateTime } from '../utils/formatters';

export const NotificationsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getAll(page, limit);
      setNotifications(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Bildirimler yüklenemedi:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, limit]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  if (loading && notifications.length === 0) {
    return <LoadingSpinner message="Bildirim geçmişi yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Üst Alan */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800">Bildirim Geçmişi</h2>
        <p className="text-xs text-slate-500">
          Sistem tarafından gönderilen e-posta ve uyarı bildirimlerinin dökümü (Toplam: {total})
        </p>
      </div>

      {/* Tablo */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="Bildirim geçmişi temiz"
          description="Sistemde henüz gönderilmiş veya kayıtlı bir bildirim bulunmuyor."
        />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3">Konu</th>
                  <th className="px-4 py-3">Alıcı E-posta</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Gönderim Tarihi</th>
                  <th className="px-4 py-3 text-right">İçerik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {notifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800 max-w-xs truncate">
                      {notif.subject}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono">
                      {notif.recipient_email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          notif.status === 'SENT'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {notif.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono">
                      {formatDateTime(notif.sent_at || notif.sentAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedNotif(notif)}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <Eye size={13} />
                        <span>Oku</span>
                      </button>
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

      {/* Detay Gösterim Modalı */}
      <Modal
        isOpen={!!selectedNotif}
        onClose={() => setSelectedNotif(null)}
        title={selectedNotif?.subject || 'Bildirim Detayı'}
      >
        {selectedNotif && (
          <div className="space-y-4">
            <div className="rounded bg-slate-50 p-3 text-xs space-y-1">
              <div>
                <span className="font-semibold text-slate-500">Alıcı:</span>{' '}
                <span className="font-mono text-slate-800">{selectedNotif.recipient_email}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Tarih:</span>{' '}
                <span className="text-slate-800 font-mono">
                  {formatDateTime(selectedNotif.sent_at || selectedNotif.sentAt)}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Durum:</span>{' '}
                <span className="font-bold text-slate-800">{selectedNotif.status}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-1">Bildirim İçeriği:</h4>
              <div className="rounded border border-slate-200 bg-white p-3 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                {selectedNotif.content}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
