import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { vehicleService } from '@/services/vehicleService';
import type { Vehicle, VehiclePayload } from '@/types';

interface VehicleFormModalProps {
  open: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onSuccess: (vehicle: Vehicle, isEdit: boolean) => void;
}

const defaultForm: VehiclePayload = {
  name: '',
  type: 'MOTORCYCLE',
  licensePlate: '',
  brand: '',
  year: new Date().getFullYear(),
  kmInterval: 3000,
  monthInterval: 3,
};

export default function VehicleFormModal({ open, onClose, vehicle, onSuccess }: VehicleFormModalProps) {
  const [form, setForm] = useState<VehiclePayload>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!vehicle;

  useEffect(() => {
    if (vehicle) {
      setForm({
        name:          vehicle.name,
        type:          vehicle.type,
        licensePlate:  vehicle.licensePlate,
        brand:         vehicle.brand,
        year:          vehicle.year,
        kmInterval:    vehicle.reminderSettings?.kmInterval    ?? 3000,
        monthInterval: vehicle.reminderSettings?.monthInterval ?? 3,
      });
    } else {
      setForm(defaultForm);
    }
    setError('');
  }, [vehicle, open]);

  const set = (key: keyof VehiclePayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        const res = await vehicleService.update(vehicle!.id, form);
        if (res.status === 'success' && res.data) {
          onSuccess(res.data.vehicle, true);
        }
      } else {
        const res = await vehicleService.create(form);
        if (res.status === 'success' && res.data) {
          onSuccess(res.data.vehicle, false);
        }
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
      title={isEdit ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
      size="md"
    >
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="label">Nama Kendaraan</label>
          <input type="text" value={form.name} onChange={set('name')} placeholder="Honda Beat 2020" className="input-field" required />
        </div>

        {/* Type + Brand in a row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Tipe</label>
            <select value={form.type} onChange={set('type')} className="input-field">
              <option value="MOTORCYCLE">Motor</option>
              <option value="CAR">Mobil</option>
            </select>
          </div>
          <div>
            <label className="label">Merek</label>
            <input type="text" value={form.brand} onChange={set('brand')} placeholder="Honda" className="input-field" required />
          </div>
        </div>

        {/* License plate + year */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Plat Nomor</label>
            <input type="text" value={form.licensePlate} onChange={set('licensePlate')} placeholder="B 1234 ABC" className="input-field uppercase" required />
          </div>
          <div>
            <label className="label">Tahun</label>
            <input type="number" value={form.year} onChange={set('year')} min={1990} max={2100} className="input-field" required />
          </div>
        </div>

        {/* Reminder intervals */}
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted mb-3 font-medium uppercase tracking-wide">Interval Ganti Oli</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Interval KM</label>
              <div className="relative">
                <input type="number" value={form.kmInterval} onChange={set('kmInterval')} min={500} max={20000} className="input-field pr-12" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">km</span>
              </div>
            </div>
            <div>
              <label className="label">Interval Bulan</label>
              <div className="relative">
                <input type="number" value={form.monthInterval} onChange={set('monthInterval')} min={1} max={24} className="input-field pr-16" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">bulan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1" disabled={loading}>
            Batal
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Menyimpan...' : isEdit ? 'Perbarui' : 'Tambah'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
