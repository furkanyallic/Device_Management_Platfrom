import React, { useEffect, useState } from 'react';
import { Mail, Eye } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types/notification';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const NotificationsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const data = await notificationService.getAll(50);
        setNotifications(data);
      } catch (error) {
        console.error('Bildirimler yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Bildirim geçmişi yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Üst Alan */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800">Bildirim Geçmişi</h2>
        <p className="text-xs text-slate-500">Sistem tarafından gönderilen e-posta ve uyarı bildirimlerinin dökümü</p>
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
                    <td className="px-4 py-3 text-slate-400">
                      {notif.sent_at ? new Date(notif.sent_at).toLocaleString('tr-TR') : '-'}
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
                <span className="text-slate-800">
                  {new Date(selectedNotif.sent_at).toLocaleString('tr-TR')}
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
