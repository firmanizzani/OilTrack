import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Car, Droplets, TrendingUp, Wallet, AlertTriangle, Clock, Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardService } from '@/services/dashboardService';
import { useAuthStore } from '@/hooks/useAuthStore';
import { StatsSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toaster';
import { formatCurrency, formatDate, formatMonth } from '@/utils';
import type { DashboardData } from '@/types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await dashboardService.get();
        if (res.status === 'success') setData(res.data);
      } catch {
        toast.error('Gagal memuat dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const chartData = data?.monthlySpending.map((m) => ({
    month: formatMonth(m.month),
    total: m.total,
  })) ?? [];

  const stats = [
    {
      label: 'Total Kendaraan',
      value: data?.totalVehicles ?? 0,
      icon: Car,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: 'Total Pengeluaran',
      value: formatCurrency(data?.totalSpending ?? 0),
      icon: Wallet,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Bulan Ini',
      value: formatCurrency(data?.spendingThisMonth ?? 0),
      icon: TrendingUp,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Perlu Servis',
      value: data?.vehicles.filter((v) => v.reminderStatus !== 'green').length ?? 0,
      icon: AlertTriangle,
      color: 'text-danger',
      bg: 'bg-danger/10',
    },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Selamat datang, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted text-sm mt-1">Ringkasan kendaraan dan pengeluaran oli kamu</p>
      </div>

      {/* Stats cards */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card p-5"
            >
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-xs text-muted mb-1">{s.label}</p>
              <p className="font-bold text-lg text-foreground leading-tight">{s.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Chart + Vehicle status — 2 columns on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Spending chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5"
        >
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            Pengeluaran 6 Bulan Terakhir
          </h2>
          {chartData.length === 0 ? (
            <EmptyState title="Belum ada data" description="Tambah riwayat oli untuk melihat grafik" className="py-8" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3E" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#161A22', border: '1px solid #2A2F3E', borderRadius: 8 }}
                  labelStyle={{ color: '#F1F5F9', fontSize: 12 }}
                  formatter={(val: number) => [formatCurrency(val), 'Total']}
                  cursor={{ fill: '#2A2F3E' }}
                />
                <Bar dataKey="total" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Vehicle reminder status */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Status Kendaraan
            </h2>
            <Link to="/vehicles" className="text-xs text-accent hover:underline">Lihat semua</Link>
          </div>

          {loading ? (
            <TableSkeleton rows={3} />
          ) : !data?.vehicles.length ? (
            <EmptyState
              title="Belum ada kendaraan"
              action={
                <Link to="/vehicles" className="btn-primary text-sm">
                  <Plus className="w-4 h-4 mr-1.5 inline" /> Tambah Kendaraan
                </Link>
              }
              className="py-6"
            />
          ) : (
            <div className="space-y-2.5">
              {data.vehicles.slice(0, 5).map((v) => (
                <Link
                  key={v.id}
                  to={`/vehicles/${v.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surfaceHigh hover:border-border
                             border border-transparent transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center shrink-0">
                    {v.type === 'CAR'
                      ? <Car className="w-4 h-4 text-muted" />
                      : <Droplets className="w-4 h-4 text-muted" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                      {v.name}
                    </p>
                    <p className="text-xs text-muted">{v.licensePlate}</p>
                  </div>
                  <StatusBadge status={v.reminderStatus} />
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent oil history */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            Riwayat Terbaru
          </h2>
          <Link to="/oil-history" className="text-xs text-accent hover:underline">Lihat semua</Link>
        </div>

        {loading ? (
          <TableSkeleton rows={4} />
        ) : !data?.recentHistory.length ? (
          <EmptyState
            title="Belum ada riwayat"
            description="Tambahkan riwayat penggantian oli kendaraan kamu"
            action={
              <Link to="/oil-history" className="btn-primary text-sm">
                <Plus className="w-4 h-4 mr-1.5 inline" /> Tambah Riwayat
              </Link>
            }
            className="py-8"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border">
                  <th className="pb-2 pr-4 font-medium">Kendaraan</th>
                  <th className="pb-2 pr-4 font-medium">Tanggal</th>
                  <th className="pb-2 pr-4 font-medium">Odometer</th>
                  <th className="pb-2 pr-4 font-medium">Oli</th>
                  <th className="pb-2 font-medium text-right">Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recentHistory.map((h) => (
                  <tr key={h.id} className="hover:bg-surfaceHigh/50 transition-colors">
                    <td className="py-2.5 pr-4 font-medium text-foreground">
                      {h.vehicle?.name ?? '-'}
                    </td>
                    <td className="py-2.5 pr-4 text-muted">{formatDate(h.changeDate)}</td>
                    <td className="py-2.5 pr-4 text-muted">{h.odometer.toLocaleString('id-ID')} km</td>
                    <td className="py-2.5 pr-4 text-muted">{h.oilType}</td>
                    <td className="py-2.5 text-right text-accent font-medium">
                      {formatCurrency(h.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
