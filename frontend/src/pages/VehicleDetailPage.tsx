import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Car, Bike, Plus, Pencil, Trash2, Droplets } from 'lucide-react';
import { oilHistoryService } from '@/services/oilHistoryService';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDeleteModal } from '@/components/ui/Modal';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toaster';
import OilHistoryFormModal from '@/components/oil-history/OilHistoryFormModal';
import { formatCurrency, formatDate, formatOdometer } from '@/utils';
import type { OilHistory, Vehicle, ReminderSettings } from '@/types';

type VehicleWithSettings = Omit<Vehicle, 'reminderSettings'> & {
  reminderSettings?: ReminderSettings;
};

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const vehicleId = parseInt(id!);

  const [vehicle, setVehicle] = useState<VehicleWithSettings | null>(null);
  const [histories, setHistories] = useState<OilHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editHistory, setEditHistory] = useState<OilHistory | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await oilHistoryService.getByVehicle(vehicleId);
      if (res.status === 'success' && res.data) {
        setVehicle(res.data.vehicle as unknown as VehicleWithSettings);
        setHistories(res.data.histories);
      }
    } catch {
      toast.error('Gagal memuat data kendaraan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [vehicleId]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await oilHistoryService.delete(deleteId);
      toast.success('Riwayat dihapus');
      setHistories((h) => h.filter((x) => x.id !== deleteId));
      setDeleteId(null);
    } catch {
      toast.error('Gagal menghapus riwayat');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = (history: OilHistory, isEdit: boolean) => {
    if (isEdit) {
      setHistories((h) => h.map((x) => (x.id === history.id ? history : x)));
      toast.success('Riwayat diperbarui');
    } else {
      setHistories((h) => [history, ...h]);
      toast.success('Riwayat ditambahkan');
    }
    setFormOpen(false);
    setEditHistory(null);
  };

  // Compute reminder status client-side for display
  const lastHistory = histories[0];
  const kmInterval = vehicle?.reminderSettings?.kmInterval ?? 3000;
  const monthInterval = vehicle?.reminderSettings?.monthInterval ?? 3;
  let reminderStatus: 'green' | 'yellow' | 'red' = 'red';
  if (lastHistory) {
    const daysSince = Math.floor((Date.now() - new Date(lastHistory.changeDate).getTime()) / 86400000);
    const ratio = daysSince / (monthInterval * 30);
    reminderStatus = ratio >= 1 ? 'red' : ratio >= 0.8 ? 'yellow' : 'green';
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Back + header */}
      <div>
        <Link to="/vehicles" className="text-muted hover:text-foreground text-sm flex items-center gap-1.5 mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Kendaraan
        </Link>

        {loading ? (
          <div className="skeleton h-12 w-64 rounded-lg" />
        ) : vehicle ? (
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-surfaceHigh border border-border flex items-center justify-center shrink-0">
              {vehicle.type === 'CAR'
                ? <Car className="w-7 h-7 text-accent" />
                : <Bike className="w-7 h-7 text-accent" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{vehicle.name}</h1>
                <StatusBadge status={reminderStatus} />
              </div>
              <p className="text-sm text-muted mt-0.5">
                {vehicle.licensePlate} · {vehicle.brand} {vehicle.year}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Info cards */}
      {!loading && vehicle && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Interval KM', value: `${kmInterval.toLocaleString('id-ID')} km` },
            { label: 'Interval Bulan', value: `${monthInterval} bulan` },
            { label: 'Terakhir Ganti', value: lastHistory ? formatDate(lastHistory.changeDate) : '-' },
            { label: 'Odometer Terakhir', value: lastHistory ? formatOdometer(lastHistory.odometer) : '-' },
          ].map((item) => (
            <div key={item.label} className="card p-4">
              <p className="text-xs text-muted mb-1">{item.label}</p>
              <p className="font-semibold text-foreground text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* History timeline */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Droplets className="w-4 h-4 text-accent" />
            Timeline Penggantian Oli
          </h2>
          <button
            onClick={() => { setEditHistory(null); setFormOpen(true); }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </div>

        {loading ? (
          <TableSkeleton rows={4} />
        ) : histories.length === 0 ? (
          <EmptyState
            title="Belum ada riwayat"
            description="Tambahkan riwayat penggantian oli pertama untuk kendaraan ini"
            icon={<Droplets className="w-7 h-7 text-muted" />}
            action={
              <button onClick={() => setFormOpen(true)} className="btn-primary text-sm">
                <Plus className="w-4 h-4 mr-1.5 inline" /> Tambah Riwayat
              </button>
            }
          />
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-1">
              {histories.map((h, i) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative pl-11 pb-5"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-background
                    ${i === 0 ? 'bg-accent' : 'bg-border'}`} />

                  <div className="card p-4 group hover:border-accent/30 transition-colors">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-medium text-foreground">{formatDate(h.changeDate)}</p>
                        <p className="text-xs text-muted mt-0.5">{h.workshop}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-accent">{formatCurrency(h.price)}</p>
                        <p className="text-xs text-muted">{formatOdometer(h.odometer)}</p>
                      </div>
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-2 text-xs text-muted">
                      <span className="px-2 py-0.5 bg-surfaceHigh rounded-md border border-border">{h.oilType}</span>
                      {h.notes && <span className="italic">{h.notes}</span>}
                    </div>

                    {/* Inline actions */}
                    <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditHistory(h); setFormOpen(true); }}
                        className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground px-2 py-1 rounded-md hover:bg-surfaceHigh transition-colors"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(h.id)}
                        className="flex items-center gap-1.5 text-xs text-danger hover:text-danger px-2 py-1 rounded-md hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form modal */}
      <OilHistoryFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditHistory(null); }}
        history={editHistory}
        vehicleId={vehicleId}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDeleteModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Riwayat"
        description="Riwayat penggantian oli ini akan dihapus permanen."
        loading={deleting}
      />
    </div>
  );
}
