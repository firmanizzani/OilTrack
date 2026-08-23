const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../middleware/helpers');
const { validationResult } = require('express-validator');

/**
 * GET /api/vehicles
 * List all vehicles for the authenticated user
 */
const getVehicles = async (req, res) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { userId: req.user.id },
    include: {
      // Include latest oil change for reminder status calculation
      oilHistories: {
        orderBy: { changeDate: 'desc' },
        take: 1,
      },
      reminderSettings: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Attach computed reminder status to each vehicle
  const vehiclesWithStatus = vehicles.map((v) => ({
    ...v,
    reminderStatus: computeReminderStatus(v),
  }));

  return successResponse(res, { vehicles: vehiclesWithStatus });
};

/**
 * POST /api/vehicles
 * Create new vehicle
 */
const createVehicle = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, errors.array()[0].msg, 422);
  }

  const { name, type, licensePlate, brand, year, icon, kmInterval, monthInterval } = req.body;

  // Check license plate uniqueness
  const existing = await prisma.vehicle.findUnique({ where: { licensePlate } });
  if (existing) {
    return errorResponse(res, 'License plate already registered.', 409);
  }

  // Create vehicle and default reminder settings in a transaction
  const vehicle = await prisma.$transaction(async (tx) => {
    const newVehicle = await tx.vehicle.create({
      data: {
        userId: req.user.id,
        name,
        type,
        licensePlate,
        brand,
        year: parseInt(year),
        icon: icon || null,
      },
    });

    await tx.reminderSettings.create({
      data: {
        vehicleId: newVehicle.id,
        kmInterval:    kmInterval    ? parseInt(kmInterval)    : 3000,
        monthInterval: monthInterval ? parseInt(monthInterval) : 3,
      },
    });

    return newVehicle;
  });

  const fullVehicle = await prisma.vehicle.findUnique({
    where: { id: vehicle.id },
    include: { oilHistories: { take: 1, orderBy: { changeDate: 'desc' } }, reminderSettings: true },
  });

  return successResponse(res, { vehicle: fullVehicle }, 'Vehicle created.', 201);
};

/**
 * GET /api/vehicles/:id
 * Get single vehicle (must belong to user)
 */
const getVehicle = async (req, res) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: parseInt(req.params.id), userId: req.user.id },
    include: {
      oilHistories: { orderBy: { changeDate: 'desc' }, take: 1 },
      reminderSettings: true,
    },
  });

  if (!vehicle) return errorResponse(res, 'Vehicle not found.', 404);

  return successResponse(res, {
    vehicle: { ...vehicle, reminderStatus: computeReminderStatus(vehicle) },
  });
};

/**
 * PUT /api/vehicles/:id
 * Update vehicle details + reminder settings
 */
const updateVehicle = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, errors.array()[0].msg, 422);
  }

  const vehicleId = parseInt(req.params.id);

  // Verify ownership
  const existing = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: req.user.id },
  });
  if (!existing) return errorResponse(res, 'Vehicle not found.', 404);

  const { name, type, licensePlate, brand, year, icon, kmInterval, monthInterval } = req.body;

  // If license plate changed, check uniqueness
  if (licensePlate && licensePlate !== existing.licensePlate) {
    const dup = await prisma.vehicle.findUnique({ where: { licensePlate } });
    if (dup) return errorResponse(res, 'License plate already registered.', 409);
  }

  const vehicle = await prisma.$transaction(async (tx) => {
    const updated = await tx.vehicle.update({
      where: { id: vehicleId },
      data: {
        ...(name         && { name }),
        ...(type         && { type }),
        ...(licensePlate && { licensePlate }),
        ...(brand        && { brand }),
        ...(year         && { year: parseInt(year) }),
        ...(icon !== undefined && { icon }),
      },
    });

    // Upsert reminder settings
    if (kmInterval !== undefined || monthInterval !== undefined) {
      await tx.reminderSettings.upsert({
        where: { vehicleId },
        update: {
          ...(kmInterval    !== undefined && { kmInterval:    parseInt(kmInterval) }),
          ...(monthInterval !== undefined && { monthInterval: parseInt(monthInterval) }),
        },
        create: {
          vehicleId,
          kmInterval:    kmInterval    ? parseInt(kmInterval)    : 3000,
          monthInterval: monthInterval ? parseInt(monthInterval) : 3,
        },
      });
    }

    return updated;
  });

  const fullVehicle = await prisma.vehicle.findUnique({
    where: { id: vehicle.id },
    include: { oilHistories: { take: 1, orderBy: { changeDate: 'desc' } }, reminderSettings: true },
  });

  return successResponse(res, { vehicle: fullVehicle }, 'Vehicle updated.');
};

/**
 * DELETE /api/vehicles/:id
 * Delete vehicle (cascades to oil_history and reminder_settings)
 */
const deleteVehicle = async (req, res) => {
  const vehicleId = parseInt(req.params.id);

  const existing = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: req.user.id },
  });
  if (!existing) return errorResponse(res, 'Vehicle not found.', 404);

  await prisma.vehicle.delete({ where: { id: vehicleId } });

  return successResponse(res, null, 'Vehicle deleted.');
};

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * computeReminderStatus
 * Returns: 'green' | 'yellow' | 'red'
 * 
 * Logic:
 *   - Get last oil change odometer & date
 *   - Compare against reminder intervals
 *   - green  = within 80% of interval
 *   - yellow = 80-100% of interval (approaching)
 *   - red    = exceeded interval (overdue)
 */
const computeReminderStatus = (vehicle) => {
  const lastHistory  = vehicle.oilHistories?.[0];
  const settings     = vehicle.reminderSettings;
  const kmInterval   = settings?.kmInterval    ?? 3000;
  const monthInterval = settings?.monthInterval ?? 3;

  if (!lastHistory) return 'red'; // Never had oil change = overdue

  // NOTE: We don't have current odometer here; status is time-based only
  // The frontend may pass current odometer for km-based calculation
  const daysSinceLast = Math.floor(
    (Date.now() - new Date(lastHistory.changeDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysInterval = monthInterval * 30;
  const ratio = daysSinceLast / daysInterval;

  if (ratio >= 1)   return 'red';
  if (ratio >= 0.8) return 'yellow';
  return 'green';
};

module.exports = { getVehicles, createVehicle, getVehicle, updateVehicle, deleteVehicle };
