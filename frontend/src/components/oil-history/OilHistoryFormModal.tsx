import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { oilHistoryService } from '@/services/oilHistoryService';
import type { OilHistory, OilHistoryPayload, Vehicle } from '@/types';

interface OilHistoryFormModalProps {
  open: boolean;
  onClose: () => void;
  history: OilHistory | null;
  vehicleId?: number;           // Pre-selected vehicle (from vehicle detail page)
  vehicles?: Vehicle[];         // Vehicle list for dropdown (from oil history page)
  onSuccess: (history: OilHistory, isEdit: boolean) => void;
}

const todayISO = () => new Date().toISOString().split('T')[0];

export default function OilHistoryFormModal({
  open, onClose, history, vehicleId, vehicles, onSuccess,
}: OilHistoryFormModalProps) {
  const [form, setForm] = useState<Omit<OilHistoryPayload, 'vehicleId'> & { vehicleId: string }>({
    vehicleId:  String(vehicleId ?? ''),
    changeDate: todayISO(),
    odometer:   0,
    oilType:    '',
    price:      0,
    workshop:   '',
    notes:      '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!history;

  useEffect(() => {
    if (history) {
      setForm({
        vehicleId:  String(history.vehicleId),
        changeDate: history.changeDate.split('T')[0],
        odometer:   history.odometer,
        oilType:    history.oilType,
        price:      history.price,
        workshop:   history.workshop,
        notes:      history.notes ?? '',
      });
    } else {
      setForm({
        vehicleId:  String(vehicleId ?? ''),
        changeDate: todayISO(),
        odometer:   0,
        oilType:    '',
        price:      0,
        workshop:   '',
        notes:      '',
      });
    }
    setError('');
  }, [history, vehicleId, open]);

  const handleChange =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.vehicleId) { setError('Pilih kendaraan terlebih dahulu.'); return; }

    const payload: OilHistoryPayload = {
      vehicleId:  parseInt(form.vehicleId),
      changeDate: form.changeDate,
      odometer:   Number(form.odometer),
      oilType:    form.oilType,
      price:      Number(form.price),
      workshop:   form.workshop,
      notes:      form.notes || undefined,
    };

    setLoading(true);
    try {
      if (isEdit) {
        const res = await oilHistoryService.update(history!.id, payload);
        if (res.status === 'success' && res.data) onSuccess(res.data.history, true);
      } else {
        const res = await oilHistoryService.create(payload);
        if (res.status === 'success' && res.data) onSuccess(res.data.history, false);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Terjadi kesalahan';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Riwayat Oli' : 'Tambah Riwayat Oli'}
      size="md"
    >
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vehicle select — shown when vehicles prop provided */}
        {vehicles && (
          <div>
            <label className="label">Kendaraan</label>
            <select
              value={form.vehicleId}
              onChange={handleChange('vehicleId')}
              className="input-field"
              required
            >
              <option value="">— Pilih Kendaraan —</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>
              ))}
            </select>
          </div>
        )}

        {/* Date + Odometer */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Tanggal Ganti</label>
            <input type="date" value={form.changeDate} onChange={handleChange('changeDate')} className="input-field" required />
          </div>
          <div>
            <label className="label">Odometer (km)</label>
            <input type="number" value={form.odometer} onChange={handleChange('odometer')} min={0} className="input-field" required />
          </div>
        </div>

        {/* Oil type */}
        <div>
          <label className="label">Jenis Oli</label>
          <input type="text" value={form.oilType} onChange={handleChange('oilType')} placeholder="Shell Helix HX7 10W-40" className="input-field" required />
        </div>

        {/* Price + Workshop */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Harga (Rp)</label>
            <input type="number" value={form.price} onChange={handleChange('price')} min={0} className="input-field" required />
          </div>
          <div>
            <label className="label">Bengkel</label>
            <input type="text" value={form.workshop} onChange={handleChange('workshop')} placeholder="Bengkel ABC" className="input-field" required />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Catatan <span className="text-muted font-normal">(opsional)</span></label>
          <textarea
            value={form.notes}
            onChange={handleChange('notes')}
            rows={2}
            placeholder="Misalnya: ganti filter juga, ada kebocoran kecil..."
            className="input-field resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1" disabled={loading}>Batal</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Menyimpan...' : isEdit ? 'Perbarui' : 'Tambah'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
