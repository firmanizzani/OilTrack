const prisma = require('../config/database');
const { successResponse } = require('../middleware/helpers');

/**
 * GET /api/dashboard
 * Returns aggregated stats for the authenticated user:
 *  - totalVehicles
 *  - totalSpending (all time)
 *  - spendingThisMonth
 *  - monthlySpending (last 6 months, for chart)
 *  - vehiclesDueForService (with reminder status)
 *  - recentHistory (last 5 records)
 */
const getDashboard = async (req, res) => {
  const userId = req.user.id;
  const now = new Date();

  // ── 1. First day of current month ───────────────────────────
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // ── 2. Count vehicles owned by user ─────────────────────────
  const totalVehicles = await prisma.vehicle.count({
    where: { userId },
  });

  // ── 3. Total spending aggregation (all time) ─────────────────
  // Prisma aggregate on oil_history joined via vehicle.userId
  const totalSpendingResult = await prisma.oilHistory.aggregate({
    where: { vehicle: { userId } },
    _sum: { price: true },
  });
  const totalSpending = Number(totalSpendingResult._sum.price) || 0;

  // ── 4. Spending this month ────────────────────────────────────
  const monthSpendingResult = await prisma.oilHistory.aggregate({
    where: {
      vehicle:    { userId },
      changeDate: { gte: firstOfMonth },
    },
    _sum: { price: true },
  });
  const spendingThisMonth = Number(monthSpendingResult._sum.price) || 0;

  // ── 5. Monthly spending for chart — last 6 months ────────────
  // Raw query aggregation: GROUP BY year+month, SUM(price)
  // We use Prisma $queryRaw for grouped aggregation
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const monthlyRaw = await prisma.$queryRaw`
    SELECT
      DATE_FORMAT(oh.change_date, '%Y-%m') AS month,
      SUM(oh.price)                        AS total
    FROM oil_history oh
    INNER JOIN vehicles v ON oh.vehicle_id = v.id
    WHERE v.user_id    = ${userId}
      AND oh.change_date >= ${sixMonthsAgo}
    GROUP BY DATE_FORMAT(oh.change_date, '%Y-%m')
    ORDER BY month ASC
  `;

  // Normalize BigInt from raw query to Number
  const monthlySpending = monthlyRaw.map((row) => ({
    month: row.month,
    total: Number(row.total),
  }));

  // ── 6. Vehicles with service reminder status ──────────────────
  const vehicles = await prisma.vehicle.findMany({
    where: { userId },
    include: {
      oilHistories:    { orderBy: { changeDate: 'desc' }, take: 1 },
      reminderSettings: true,
    },
  });

  // Compute reminder status for each vehicle
  const vehiclesWithStatus = vehicles.map((v) => {
    const lastHistory   = v.oilHistories?.[0];
    const settings      = v.reminderSettings;
    const kmInterval    = settings?.kmInterval    ?? 3000;
    const monthInterval = settings?.monthInterval ?? 3;

    let status = 'red';
    if (lastHistory) {
      const daysSince = Math.floor(
        (Date.now() - new Date(lastHistory.changeDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysInterval = monthInterval * 30;
      const ratio = daysSince / daysInterval;
      if (ratio < 0.8)  status = 'green';
      else if (ratio < 1) status = 'yellow';
      else               status = 'red';
    }

    return {
      id:           v.id,
      name:         v.name,
      type:         v.type,
      licensePlate: v.licensePlate,
      brand:        v.brand,
      icon:         v.icon,
      lastChangeDate:     lastHistory?.changeDate ?? null,
      lastChangeOdometer: lastHistory?.odometer   ?? null,
      reminderStatus: status,
      kmInterval,
      monthInterval,
    };
  });

  // ── 7. Recent oil history (last 5) ────────────────────────────
  const recentHistory = await prisma.oilHistory.findMany({
    where:   { vehicle: { userId } },
    include: { vehicle: { select: { id: true, name: true, licensePlate: true } } },
    orderBy: { changeDate: 'desc' },
    take: 5,
  });

  return successResponse(res, {
    totalVehicles,
    totalSpending,
    spendingThisMonth,
    monthlySpending,
    vehicles: vehiclesWithStatus,
    recentHistory,
  });
};

module.exports = { getDashboard };
