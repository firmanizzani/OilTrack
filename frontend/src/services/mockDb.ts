/**
 * mockDb.ts — In-memory + localStorage database untuk mode demo (tanpa backend)
 * Semua operasi CRUD disimulasikan di sini.
 * Data di-persist ke localStorage agar tidak hilang saat refresh.
 */

import type { User, Vehicle, OilHistory, ReminderSettings } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DbUser extends User {
  password: string;
}

interface DbVehicle extends Vehicle {
  reminderSettings: ReminderSettings;
  oilHistories: OilHistory[];
}

interface MockDb {
  users: DbUser[];
  vehicles: DbVehicle[];
  oilHistories: OilHistory[];
  nextId: { users: number; vehicles: number; histories: number };
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED: MockDb = {
  nextId: { users: 2, vehicles: 4, histories: 10 },
  users: [
    {
      id: 1, email: 'demo@olitrack.com', name: 'Budi Santoso',
      password: 'demo1234', createdAt: '2024-01-01T00:00:00Z',
    },
  ],
  vehicles: [
    {
      id: 1, userId: 1, name: 'Honda Beat 2021', type: 'MOTORCYCLE',
      licensePlate: 'B 3456 XYZ', brand: 'Honda', year: 2021, icon: 'bike',
      createdAt: '2024-01-10T00:00:00Z', updatedAt: '2024-01-10T00:00:00Z',
      reminderSettings: { id: 1, vehicleId: 1, kmInterval: 3000, monthInterval: 3 },
      oilHistories: [],
    },
    {
      id: 2, userId: 1, name: 'Toyota Avanza 2019', type: 'CAR',
      licensePlate: 'D 1234 ABC', brand: 'Toyota', year: 2019, icon: 'car',
      createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z',
      reminderSettings: { id: 2, vehicleId: 2, kmInterval: 5000, monthInterval: 4 },
      oilHistories: [],
    },
    {
      id: 3, userId: 1, name: 'Yamaha NMAX 2022', type: 'MOTORCYCLE',
      licensePlate: 'B 8888 NMX', brand: 'Yamaha', year: 2022, icon: 'bike',
      createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z',
      reminderSettings: { id: 3, vehicleId: 3, kmInterval: 3000, monthInterval: 3 },
      oilHistories: [],
    },
  ],
  oilHistories: [
    // Honda Beat — riwayat
    {
      id: 1, vehicleId: 1, changeDate: '2024-11-10T00:00:00Z',
      odometer: 18500, oilType: 'Shell Advance AX7 10W-40', price: 85000,
      workshop: 'Bengkel Maju Jaya', notes: 'Ganti filter juga',
      createdAt: '2024-11-10T00:00:00Z', updatedAt: '2024-11-10T00:00:00Z',
    },
    {
      id: 2, vehicleId: 1, changeDate: '2024-08-05T00:00:00Z',
      odometer: 15500, oilType: 'Shell Advance AX7 10W-40', price: 85000,
      workshop: 'Bengkel Maju Jaya', notes: undefined,
      createdAt: '2024-08-05T00:00:00Z', updatedAt: '2024-08-05T00:00:00Z',
    },
    {
      id: 3, vehicleId: 1, changeDate: '2024-05-20T00:00:00Z',
      odometer: 12500, oilType: 'Pertamina Fastron 10W-40', price: 75000,
      workshop: 'AHASS Honda Sunter', notes: undefined,
      createdAt: '2024-05-20T00:00:00Z', updatedAt: '2024-05-20T00:00:00Z',
    },
    // Toyota Avanza — riwayat
    {
      id: 4, vehicleId: 2, changeDate: '2024-10-22T00:00:00Z',
      odometer: 62000, oilType: 'Toyota Genuine Oil 10W-30', price: 280000,
      workshop: 'Auto2000 Depok', notes: 'Sekalian tune up',
      createdAt: '2024-10-22T00:00:00Z', updatedAt: '2024-10-22T00:00:00Z',
    },
    {
      id: 5, vehicleId: 2, changeDate: '2024-06-15T00:00:00Z',
      odometer: 57000, oilType: 'Castrol GTX 10W-40', price: 260000,
      workshop: 'Auto2000 Depok', notes: undefined,
      createdAt: '2024-06-15T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z',
    },
    {
      id: 6, vehicleId: 2, changeDate: '2024-02-10T00:00:00Z',
      odometer: 52000, oilType: 'Castrol GTX 10W-40', price: 255000,
      workshop: 'Bengkel Pak Hendra', notes: undefined,
      createdAt: '2024-02-10T00:00:00Z', updatedAt: '2024-02-10T00:00:00Z',
    },
    // Yamaha NMAX
    {
      id: 7, vehicleId: 3, changeDate: '2025-01-05T00:00:00Z',
      odometer: 9800, oilType: 'Yamalube Sport 10W-40', price: 95000,
      workshop: 'Yamaha Dealer Kelapa Gading', notes: undefined,
      createdAt: '2025-01-05T00:00:00Z', updatedAt: '2025-01-05T00:00:00Z',
    },
    {
      id: 8, vehicleId: 3, changeDate: '2024-10-01T00:00:00Z',
      odometer: 6800, oilType: 'Yamalube Sport 10W-40', price: 95000,
      workshop: 'Yamaha Dealer Kelapa Gading', notes: 'Busi ikut diganti',
      createdAt: '2024-10-01T00:00:00Z', updatedAt: '2024-10-01T00:00:00Z',
    },
  ],
};

// ─── Persistence ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'olitrack_mock_db';

function loadDb(): MockDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MockDb;
  } catch { /* ignore */ }
  // First run: save seed data
  saveDb(SEED);
  return structuredClone(SEED);
}

function saveDb(db: MockDb): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const mockDb = {
  // ── Users ──────────────────────────────────────────────────────────────────
  findUserByEmail(email: string): DbUser | undefined {
    return loadDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  createUser(name: string, email: string, password: string): DbUser {
    const db = loadDb();
    const user: DbUser = {
      id: db.nextId.users++,
      name, email, password,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    saveDb(db);
    return user;
  },

  // ── Vehicles ───────────────────────────────────────────────────────────────
  getVehicles(userId: number): DbVehicle[] {
    const db = loadDb();
    return db.vehicles
      .filter((v) => v.userId === userId)
      .map((v) => ({
        ...v,
        oilHistories: db.oilHistories
          .filter((h) => h.vehicleId === v.id)
          .sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime())
          .slice(0, 1),
      }));
  },

  getVehicle(id: number, userId: number): DbVehicle | undefined {
    const db = loadDb();
    const v = db.vehicles.find((v) => v.id === id && v.userId === userId);
    if (!v) return undefined;
    return {
      ...v,
      oilHistories: db.oilHistories
        .filter((h) => h.vehicleId === v.id)
        .sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime()),
    };
  },

  createVehicle(
    userId: number,
    data: { name: string; type: 'MOTORCYCLE' | 'CAR'; licensePlate: string; brand: string; year: number; icon?: string; kmInterval?: number; monthInterval?: number }
  ): DbVehicle {
    const db = loadDb();
    const id = db.nextId.vehicles++;
    const v: DbVehicle = {
      id, userId,
      name: data.name, type: data.type,
      licensePlate: data.licensePlate.toUpperCase(),
      brand: data.brand, year: data.year, icon: data.icon,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      reminderSettings: {
        id, vehicleId: id,
        kmInterval: data.kmInterval ?? 3000,
        monthInterval: data.monthInterval ?? 3,
      },
      oilHistories: [],
    };
    db.vehicles.push(v);
    saveDb(db);
    return v;
  },

  updateVehicle(id: number, userId: number, data: Partial<DbVehicle>): DbVehicle | undefined {
    const db = loadDb();
    const idx = db.vehicles.findIndex((v) => v.id === id && v.userId === userId);
    if (idx === -1) return undefined;
    db.vehicles[idx] = {
      ...db.vehicles[idx],
      ...data,
      id, userId,
      updatedAt: new Date().toISOString(),
      reminderSettings: {
        ...db.vehicles[idx].reminderSettings,
        ...(data.reminderSettings ?? {}),
      },
    };
    saveDb(db);
    return this.getVehicle(id, userId);
  },

  deleteVehicle(id: number, userId: number): boolean {
    const db = loadDb();
    const before = db.vehicles.length;
    db.vehicles = db.vehicles.filter((v) => !(v.id === id && v.userId === userId));
    db.oilHistories = db.oilHistories.filter((h) => h.vehicleId !== id);
    saveDb(db);
    return db.vehicles.length < before;
  },

  isLicensePlateUsed(plate: string, excludeId?: number): boolean {
    const db = loadDb();
    return db.vehicles.some(
      (v) => v.licensePlate.toUpperCase() === plate.toUpperCase() && v.id !== excludeId
    );
  },

  // ── Oil Histories ──────────────────────────────────────────────────────────
  getOilHistories(
    userId: number,
    filters: { vehicleId?: number; dateFrom?: string; dateTo?: string; workshop?: string; page?: number; limit?: number }
  ) {
    const db = loadDb();
    const userVehicleIds = new Set(db.vehicles.filter((v) => v.userId === userId).map((v) => v.id));

    let list = db.oilHistories.filter((h) => userVehicleIds.has(h.vehicleId));

    if (filters.vehicleId) list = list.filter((h) => h.vehicleId === filters.vehicleId);
    if (filters.dateFrom)  list = list.filter((h) => h.changeDate >= filters.dateFrom!);
    if (filters.dateTo)    list = list.filter((h) => h.changeDate <= filters.dateTo! + 'T23:59:59Z');
    if (filters.workshop)  list = list.filter((h) => h.workshop.toLowerCase().includes(filters.workshop!.toLowerCase()));

    list = list.sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime());

    const total = list.length;
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 15;
    const paginated = list.slice((page - 1) * limit, page * limit);

    // Attach vehicle info
    const withVehicle = paginated.map((h) => ({
      ...h,
      vehicle: db.vehicles.find((v) => v.id === h.vehicleId)
        ? { id: db.vehicles.find((v) => v.id === h.vehicleId)!.id,
            name: db.vehicles.find((v) => v.id === h.vehicleId)!.name,
            licensePlate: db.vehicles.find((v) => v.id === h.vehicleId)!.licensePlate }
        : undefined,
    }));

    return { histories: withVehicle, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  },

  getVehicleOilHistory(vehicleId: number, userId: number) {
    const db = loadDb();
    const vehicle = db.vehicles.find((v) => v.id === vehicleId && v.userId === userId);
    if (!vehicle) return null;
    const histories = db.oilHistories
      .filter((h) => h.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime());
    return { vehicle: { ...vehicle }, histories };
  },

  createOilHistory(data: { vehicleId: number; changeDate: string; odometer: number; oilType: string; price: number; workshop: string; notes?: string }): OilHistory {
    const db = loadDb();
    const vehicle = db.vehicles.find((v) => v.id === data.vehicleId);
    const id = db.nextId.histories++;
    const h: OilHistory = {
      id,
      vehicleId: data.vehicleId,
      changeDate: new Date(data.changeDate).toISOString(),
      odometer: data.odometer,
      oilType: data.oilType,
      price: data.price,
      workshop: data.workshop,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      vehicle: vehicle ? { id: vehicle.id, name: vehicle.name, licensePlate: vehicle.licensePlate } : undefined,
    };
    db.oilHistories.push(h);
    saveDb(db);
    return h;
  },

  updateOilHistory(id: number, userId: number, data: Partial<OilHistory>): OilHistory | undefined {
    const db = loadDb();
    const userVehicleIds = new Set(db.vehicles.filter((v) => v.userId === userId).map((v) => v.id));
    const idx = db.oilHistories.findIndex((h) => h.id === id && userVehicleIds.has(h.vehicleId));
    if (idx === -1) return undefined;
    db.oilHistories[idx] = {
      ...db.oilHistories[idx],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    saveDb(db);
    const vehicle = db.vehicles.find((v) => v.id === db.oilHistories[idx].vehicleId);
    return {
      ...db.oilHistories[idx],
      vehicle: vehicle ? { id: vehicle.id, name: vehicle.name, licensePlate: vehicle.licensePlate } : undefined,
    };
  },

  deleteOilHistory(id: number, userId: number): boolean {
    const db = loadDb();
    const userVehicleIds = new Set(db.vehicles.filter((v) => v.userId === userId).map((v) => v.id));
    const before = db.oilHistories.length;
    db.oilHistories = db.oilHistories.filter((h) => !(h.id === id && userVehicleIds.has(h.vehicleId)));
    saveDb(db);
    return db.oilHistories.length < before;
  },

  // ── Dashboard ──────────────────────────────────────────────────────────────
  getDashboard(userId: number) {
    const db = loadDb();
    const userVehicles = db.vehicles.filter((v) => v.userId === userId);
    const userVehicleIds = new Set(userVehicles.map((v) => v.id));
    const allHistories = db.oilHistories.filter((h) => userVehicleIds.has(h.vehicleId));

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalSpending = allHistories.reduce((s, h) => s + Number(h.price), 0);
    const spendingThisMonth = allHistories
      .filter((h) => new Date(h.changeDate) >= firstOfMonth)
      .reduce((s, h) => s + Number(h.price), 0);

    // Monthly spending — last 6 months
    const monthlyMap: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = 0;
    }
    allHistories.forEach((h) => {
      const d = new Date(h.changeDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in monthlyMap) monthlyMap[key] += Number(h.price);
    });
    const monthlySpending = Object.entries(monthlyMap).map(([month, total]) => ({ month, total }));

    // Vehicle status
    const vehicles = userVehicles.map((v) => {
      const histories = allHistories
        .filter((h) => h.vehicleId === v.id)
        .sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime());
      const last = histories[0];
      const kmInterval = v.reminderSettings?.kmInterval ?? 3000;
      const monthInterval = v.reminderSettings?.monthInterval ?? 3;
      let reminderStatus: 'green' | 'yellow' | 'red' = 'red';
      if (last) {
        const days = Math.floor((Date.now() - new Date(last.changeDate).getTime()) / 86400000);
        const ratio = days / (monthInterval * 30);
        reminderStatus = ratio >= 1 ? 'red' : ratio >= 0.8 ? 'yellow' : 'green';
      }
      return {
        id: v.id, name: v.name, type: v.type, licensePlate: v.licensePlate,
        brand: v.brand, icon: v.icon,
        lastChangeDate: last?.changeDate ?? null,
        lastChangeOdometer: last?.odometer ?? null,
        reminderStatus, kmInterval, monthInterval,
      };
    });

    // Recent history (last 5)
    const recentHistory = allHistories
      .sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime())
      .slice(0, 5)
      .map((h) => {
        const vehicle = userVehicles.find((v) => v.id === h.vehicleId);
        return { ...h, vehicle: vehicle ? { id: vehicle.id, name: vehicle.name, licensePlate: vehicle.licensePlate } : undefined };
      });

    return {
      totalVehicles: userVehicles.length,
      totalSpending,
      spendingThisMonth,
      monthlySpending,
      vehicles,
      recentHistory,
    };
  },

  // ── Utility ────────────────────────────────────────────────────────────────
  /** Reset database ke seed awal */
  reset() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
