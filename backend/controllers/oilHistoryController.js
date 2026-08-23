const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../middleware/helpers');
const { validationResult } = require('express-validator');

/**
 * GET /api/oil-history
 * List oil history with optional filters via query parameters:
 *   - vehicleId: filter by vehicle
 *   - dateFrom / dateTo: date range (ISO strings)
 *   - workshop: partial match on workshop name
 *   - page / limit: pagination
 */
const getOilHistories = async (req, res) => {
  const userId = req.user.id;
  const {
    vehicleId,
    dateFrom,
    dateTo,
    workshop,
    page  = 1,
    limit = 20,
  } = req.query;

  // Build where clause for oil_history
  const where = {
    // Join through vehicle to enforce user ownership
    vehicle: { userId },
  };

  if (vehicleId) {
    where.vehicleId = parseInt(vehicleId);
  }

  if (dateFrom || dateTo) {
    where.changeDate = {};
    if (dateFrom) where.changeDate.gte = new Date(dateFrom);
    if (dateTo)   where.changeDate.lte = new Date(dateTo);
  }

  // Workshop partial search (case-insensitive via Prisma contains)
  if (workshop) {
    where.workshop = { contains: workshop };
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Execute count + data queries in parallel for efficiency
  const [total, histories] = await Promise.all([
    prisma.oilHistory.count({ where }),
    prisma.oilHistory.findMany({
      where,
      include: {
        vehicle: { select: { id: true, name: true, type: true, licensePlate: true } },
      },
      orderBy: { changeDate: 'desc' },
      skip,
      take,
    }),
  ]);

  return successResponse(res, {
    histories,
    pagination: {
      total,
      page:       parseInt(page),
      limit:      take,
      totalPages: Math.ceil(total / take),
    },
  });
};

/**
 * GET /api/oil-history/vehicle/:vehicleId
 * Timeline of oil history for a single vehicle
 */
const getVehicleOilHistory = async (req, res) => {
  const vehicleId = parseInt(req.params.vehicleId);

  // Verify vehicle belongs to user
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: req.user.id },
    include: { reminderSettings: true },
  });
  if (!vehicle) return errorResponse(res, 'Vehicle not found.', 404);

  const histories = await prisma.oilHistory.findMany({
    where: { vehicleId },
    orderBy: { changeDate: 'desc' },
  });

  return successResponse(res, { vehicle, histories });
};

/**
 * POST /api/oil-history
 * Add new oil change record
 */
const createOilHistory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, errors.array()[0].msg, 422);
  }

  const { vehicleId, changeDate, odometer, oilType, price, workshop, notes } = req.body;

  // Verify ownership of the target vehicle
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: parseInt(vehicleId), userId: req.user.id },
  });
  if (!vehicle) return errorResponse(res, 'Vehicle not found.', 404);

  const history = await prisma.oilHistory.create({
    data: {
      vehicleId: parseInt(vehicleId),
      changeDate: new Date(changeDate),
      odometer: parseInt(odometer),
      oilType,
      price: parseFloat(price),
      workshop,
      notes: notes || null,
    },
    include: {
      vehicle: { select: { id: true, name: true, licensePlate: true } },
    },
  });

  return successResponse(res, { history }, 'Oil change record added.', 201);
};

/**
 * PUT /api/oil-history/:id
 * Update an oil change record
 */
const updateOilHistory = async (req, res) => {
  const historyId = parseInt(req.params.id);

  // Verify record exists and user owns the parent vehicle
  const existing = await prisma.oilHistory.findFirst({
    where: { id: historyId, vehicle: { userId: req.user.id } },
  });
  if (!existing) return errorResponse(res, 'Record not found.', 404);

  const { changeDate, odometer, oilType, price, workshop, notes } = req.body;

  const history = await prisma.oilHistory.update({
    where: { id: historyId },
    data: {
      ...(changeDate !== undefined && { changeDate: new Date(changeDate) }),
      ...(odometer   !== undefined && { odometer:   parseInt(odometer) }),
      ...(oilType    !== undefined && { oilType }),
      ...(price      !== undefined && { price:      parseFloat(price) }),
      ...(workshop   !== undefined && { workshop }),
      ...(notes      !== undefined && { notes }),
    },
    include: {
      vehicle: { select: { id: true, name: true, licensePlate: true } },
    },
  });

  return successResponse(res, { history }, 'Record updated.');
};

/**
 * DELETE /api/oil-history/:id
 * Delete an oil change record
 */
const deleteOilHistory = async (req, res) => {
  const historyId = parseInt(req.params.id);

  const existing = await prisma.oilHistory.findFirst({
    where: { id: historyId, vehicle: { userId: req.user.id } },
  });
  if (!existing) return errorResponse(res, 'Record not found.', 404);

  await prisma.oilHistory.delete({ where: { id: historyId } });

  return successResponse(res, null, 'Record deleted.');
};

module.exports = {
  getOilHistories, getVehicleOilHistory,
  createOilHistory, updateOilHistory, deleteOilHistory,
};
