import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Car, Bike, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { vehicleService } from '@/services/vehicleService';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDeleteModal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toaster';
import VehicleFormModal from '@/components/vehicles/VehicleFormModal';
import type { Vehicle } from '@/types';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVehicles = async () => {
    try {
      const res = await vehicleService.getAll();
      if (res.status === 'success') setVehicles(res.data?.vehicles ?? []);
    } catch {
      toast.error('Gagal memuat kendaraan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await vehicleService.delete(deleteId);
      toast.success('Kendaraan dihapus');
      setVehicles((v) => v.filter((x) => x.id !== deleteId));
      setDeleteId(null);
    } catch {
      toast.error('Gagal menghapus kendaraan');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = (vehicle: Vehicle, isEdit: boolean) => {
    if (isEdit) {
      setVehicles((v) => v.map((x) => (x.id === vehicle.id ? vehicle : x)));
      toast.success('Kendaraan diperbarui');
    } else {
      setVehicles((v) => [vehicle, ...v]);
      toast.success('Kendaraan ditambahkan');
    }
    setFormOpen(false);
    setEditVehicle(null);
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kendaraan</h1>
          <p className="text-sm text-muted mt-1">Kelola motor dan mobil kamu</p>
        </div>
        <button onClick={() => { setEditVehicle(null); setFormOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah</span>
        </button>
      </div>

      {/* Vehicle list */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : vehicles.length === 0 ? (
        <div className="card">
          <EmptyState
            title="Belum ada kendaraan"
            description="Tambahkan motor atau mobil kamu untuk mulai melacak penggantian oli"
            icon={<Car className="w-7 h-7 text-muted" />}
            action={
              <button onClick={() => setFormOpen(true)} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" /> Tambah Kendaraan
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vehicles.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5 flex flex-col gap-3"
            >
              {/* Vehicle header */}
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-lg bg-surfaceHigh border border-border flex items-center justify-center shrink-0">
                  {v.type === 'CAR'
                    ? <Car className="w-5 h-5 text-accent" />
                    : <Bike className="w-5 h-5 text-accent" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{v.name}</h3>
                  <p className="text-xs text-muted mt-0.5">{v.licensePlate} • {v.brand} {v.year}</p>
                </div>
                {v.reminderStatus && <StatusBadge status={v.reminderStatus} />}
              </div>

              {/* Reminder info */}
              <div className="text-xs text-muted border-t border-border pt-3 flex items-center gap-4">
                {v.oilHistories?.[0] ? (
                  <>
                    <span>Terakhir: {new Date(v.oilHistories[0].changeDate).toLocaleDateString('id-ID')}</span>
                    <span>{v.oilHistories[0].odometer.toLocaleString('id-ID')} km</span>
                  </>
                ) : (
                  <span className="text-danger">Belum ada riwayat oli</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  to={`/vehicles/${v.id}`}
                  className="flex-1 btn-ghost text-sm flex items-center justify-center gap-1.5"
                >
                  Lihat Detail <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => { setEditVehicle(v); setFormOpen(true); }}
                  className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surfaceHigh transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(v.id)}
                  className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Vehicle form modal */}
      <VehicleFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditVehicle(null); }}
        vehicle={editVehicle}
        onSuccess={handleFormSuccess}
      />

      {/* Confirm delete */}
      <ConfirmDeleteModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Kendaraan"
        description="Semua riwayat oli untuk kendaraan ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan."
        loading={deleting}
      />
    </div>
  );
}
