import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ReminderStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format number as IDR currency */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format ISO date string to readable format */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Format month key 'YYYY-MM' to 'Mon YY' */
export function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('id-ID', {
    month: 'short',
    year: '2-digit',
  });
}

/** Get reminder status badge color classes */
export function getStatusClasses(status: ReminderStatus): string {
  switch (status) {
    case 'green':  return 'bg-success/20 text-success border-success/30';
    case 'yellow': return 'bg-warning/20 text-warning border-warning/30';
    case 'red':    return 'bg-danger/20 text-danger border-danger/30';
  }
}

export function getStatusLabel(status: ReminderStatus): string {
  switch (status) {
    case 'green':  return 'OK';
    case 'yellow': return 'Segera';
    case 'red':    return 'Terlambat';
  }
}

/** Format odometer with km suffix */
export function formatOdometer(km: number): string {
  return `${km.toLocaleString('id-ID')} km`;
}
