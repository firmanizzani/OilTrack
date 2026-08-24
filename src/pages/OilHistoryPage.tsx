import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Droplets, Pencil, Trash2, Search, Calendar, Filter, X } from 'lucide-react';
import { oilHistoryService } from '@/services/oilHistoryService';
import { vehicleService } from '@/services/vehicleService';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDeleteModal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toaster';
import OilHistoryFormModal from '@/components/oil-history/OilHistoryFormModal';
import { formatCurrency, formatDate, formatOdometer } from '@/utils';
import type { OilHistory, Vehicle, OilHistoryFilters } from '@/types';

export default function OilHistoryPage() {
  const [histories, setHistories] = useState<OilHistory[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [filters, setFilters] = useState<OilHistoryFilters>({ page: 1, limit: 15 });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [editHistory, setEditHistory] = useState<OilHistory | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch vehicles for select
  useEffect(() => {
    vehicleService.getAll().then((res) => {
      if (res.status === 'success') setVehicles(res.data?.vehicles ?? []);
    });
  }, []);

  const fetchHistories = async (f: OilHistoryFilters) => {
    setLoading(true);
    try {
      const res = await oilHistoryService.getAll(f);
      if (res.status === 'success' && res.data) {
        setHistories(res.data.histories);
        setTotal(res.data.pagination.total);
      }
    } catch {
      toast.error('Gagal memuat riwayat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistories(filters); }, [filters]);

  // Debounced workshop search
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, workshop: search || undefined, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await oilHistoryService.delete(deleteId);
      toast.success('Riwayat dihapus');
      setHistories((h) => h.filter((x) => x.id !== deleteId));
      setDeleteId(null);
    } catch {
      toast.error('Gagal menghapus');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = (history: OilHistory, isEdit: boolean) => {
    if (isEdit) {
      setHistories((h) => h.map((x) => (x.id === history.id ? history : x)));
      toast.success('Riwayat diperbarui');
    } else {
      fetchHistories({ ...filters, page: 1 });
      toast.success('Riwayat ditambahkan');
    }
    setFormOpen(false);
    setEditHistory(null);
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 15 });
    setSearch('');
  };

  const totalPages = Math.ceil(total / (filters.limit ?? 15));
  const hasFilters = !!(search || filters.vehicleId || filters.dateFrom || filters.dateTo);

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Riwayat Oli</h1>
          <p className="text-sm text-muted mt-1">{total} record tercatat</p>
        </div>
        <button onClick={() => { setEditHistory(null); setFormOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah</span>
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari riwayat ganti oli..."
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`btn-ghost flex items-center gap-2 text-sm ${showFilters ? 'border-accent text-accent' : ''}`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Expanded filter panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-border"
          >
            {/* Vehicle filter */}
            <div>
              <label className="label text-xs">Kendaraan</label>
              <select
                value={filters.vehicleId ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    vehicleId: e.target.value ? parseInt(e.target.value) : undefined,
                    page: 1,
                  }))
                }
                className="input-field text-sm"
              >
                <option value="">Semua Kendaraan</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            {/* Date from */}
            <div>
              <label className="label text-xs flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Dari Tanggal
              </label>
              <input
                type="date"
                value={filters.dateFrom ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value || undefined, page: 1 }))}
                className="input-field text-sm"
              />
            </div>

            {/* Date to */}
            <div>
              <label className="label text-xs flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Sampai Tanggal
              </label>
              <input
                type="date"
                value={filters.dateTo ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value || undefined, page: 1 }))}
                className="input-field text-sm"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={6} />
          </div>
        ) : histories.length === 0 ? (
          <EmptyState
            title="Tidak ada riwayat"
            description={hasFilters ? 'Coba ubah filter pencarian' : 'Mulai tambahkan riwayat penggantian oli'}
            icon={<Droplets className="w-7 h-7 text-muted" />}
            action={
              !hasFilters ? (
                <button onClick={() => setFormOpen(true)} className="btn-primary text-sm">
                  <Plus className="w-4 h-4 mr-1.5 inline" /> Tambah Riwayat
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-border">
              {histories.map((h, i) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <p className="font-medium text-foreground text-sm">{h.vehicle?.name ?? '-'}</p>
                      <p className="text-xs text-muted">{formatDate(h.changeDate)} · {h.workshop}</p>
                    </div>
                    <p className="text-accent font-semibold text-sm">{formatCurrency(h.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted flex-wrap">
                    <span>{formatOdometer(h.odometer)}</span>
                    <span className="px-1.5 py-0.5 bg-surfaceHigh rounded border border-border">{h.oilType}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => { setEditHistory(h); setFormOpen(true); }} className="text-xs text-muted hover:text-foreground flex items-center gap-1">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => setDeleteId(h.id)} className="text-xs text-danger flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted border-b border-border">
                    {['Kendaraan', 'Tanggal', 'Odometer', 'Jenis Oli', 'Bengkel', 'Biaya', ''].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {histories.map((h, i) => (
                    <motion.tr
                      key={h.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-surfaceHigh/50 transition-colors group"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{h.vehicle?.name ?? '-'}</td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">{formatDate(h.changeDate)}</td>
                      <td className="px-4 py-3 text-muted">{formatOdometer(h.odometer)}</td>
                      <td className="px-4 py-3 text-muted">{h.oilType}</td>
                      <td className="px-4 py-3 text-muted">{h.workshop}</td>
                      <td className="px-4 py-3 text-accent font-semibold">{formatCurrency(h.price)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditHistory(h); setFormOpen(true); }}
                            className="p-1.5 rounded text-muted hover:text-foreground hover:bg-surfaceHigh"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(h.id)}
                            className="p-1.5 rounded text-muted hover:text-danger hover:bg-danger/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
                <p className="text-muted text-xs">
                  Menampilkan {histories.length} dari {total} record
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { const p = page - 1; setPage(p); setFilters((f) => ({ ...f, page: p })); }}
                    disabled={page <= 1}
                    className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  <span className="px-3 py-1.5 text-xs text-muted">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => { const p = page + 1; setPage(p); setFilters((f) => ({ ...f, page: p })); }}
                    disabled={page >= totalPages}
                    className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form modal */}
      <OilHistoryFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditHistory(null); }}
        history={editHistory}
        vehicleId={undefined}
        vehicles={vehicles}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDeleteModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Riwayat"
        loading={deleting}
      />
    </div>
  );
}
