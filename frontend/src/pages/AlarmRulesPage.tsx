import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Settings } from 'lucide-react';
import { alarmRuleService } from '../services/alarmRuleService';
import type { AlarmRule, CreateAlarmRuleDto, UpdateAlarmRuleDto } from '../types/alarm';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { AlarmRuleModal } from '../components/AlarmRuleModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Toast, type ToastType } from '../components/ui/Toast';

export const AlarmRulesPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [rules, setRules] = useState<AlarmRule[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<AlarmRule | null>(null);

  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await alarmRuleService.getAll();
      setRules(data);
    } catch (error) {
      console.error('Kurallar yüklenemedi:', error);
      setToast({ message: 'Alarm kuralları yüklenirken hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingRule(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (rule: AlarmRule) => {
    setEditingRule(rule);
    setModalOpen(true);
  };

  const handleSubmitRule = async (data: CreateAlarmRuleDto | UpdateAlarmRuleDto) => {
    try {
      if (editingRule) {
        await alarmRuleService.update(editingRule.id, data);
        setToast({ message: 'Alarm kuralı güncellendi.', type: 'success' });
      } else {
        await alarmRuleService.create(data as CreateAlarmRuleDto);
        setToast({ message: 'Yeni alarm kuralı oluşturuldu.', type: 'success' });
      }
      await fetchRules();
    } catch (error) {
      console.error('Kural kaydetme hatası:', error);
      setToast({ message: 'Kural kaydedilemedi.', type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRuleId) return;
    setDeleteLoading(true);
    try {
      await alarmRuleService.delete(deletingRuleId);
      setToast({ message: 'Alarm kuralı silindi.', type: 'success' });
      setDeletingRuleId(null);
      await fetchRules();
    } catch (error) {
      console.error('Silme hatası:', error);
      setToast({ message: 'Alarm kuralı silinirken hata oluştu.', type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Alarm kuralları yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Üst Alan */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Alarm Kuralları</h2>
          <p className="text-xs text-slate-500">Cihaz telemetri verilerine göre otomatik alarm tetikleme kuralları</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 rounded-md bg-slate-800 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-900 transition-colors"
        >
          <Plus size={16} />
          <span>Yeni Kural</span>
        </button>
      </div>

      {/* Tablo */}
      {rules.length === 0 ? (
        <EmptyState
          icon={Settings}
          title="Henüz tanımlı kural yok"
          description="Otomatik alarm oluşturmak için yeni kural ekleyebilirsiniz."
          actionLabel="Kural Oluştur"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3">Cihaz ID</th>
                  <th className="px-4 py-3">Metrik</th>
                  <th className="px-4 py-3">Operatör</th>
                  <th className="px-4 py-3">Eşik Değeri</th>
                  <th className="px-4 py-3">Şiddet</th>
                  <th className="px-4 py-3">Aktiflik</th>
                  <th className="px-4 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      {rule.deviceId ? rule.deviceId.substring(0, 8) + '...' : '-'}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                      {rule.metricName}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">
                      {rule.operator}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">
                      {rule.threshold}
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={rule.severity} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          rule.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {rule.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(rule)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          title="Düzenle"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingRuleId(rule.id)}
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
      <AlarmRuleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitRule}
        initialData={editingRule}
      />

      <ConfirmDialog
        isOpen={!!deletingRuleId}
        onClose={() => setDeletingRuleId(null)}
        onConfirm={handleDeleteConfirm}
        title="Kuralı Sil"
        message="Bu alarm kuralını silmek istediğinize emin misiniz?"
        loading={deleteLoading}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};
