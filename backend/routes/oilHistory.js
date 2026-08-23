const { body } = require('express-validator');
const express = require('express');
const router = express.Router();
const {
  getOilHistories, getVehicleOilHistory,
  createOilHistory, updateOilHistory, deleteOilHistory,
} = require('../controllers/oilHistoryController');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/helpers');

router.use(authenticate);

const historyValidation = [
  body('vehicleId').isInt({ min: 1 }).withMessage('Valid vehicle ID is required.'),
  body('changeDate').isISO8601().withMessage('Valid date is required.'),
  body('odometer').isInt({ min: 0 }).withMessage('Valid odometer reading is required.'),
  body('oilType').trim().notEmpty().withMessage('Oil type is required.'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required.'),
  body('workshop').trim().notEmpty().withMessage('Workshop name is required.'),
];

router.get('/',                        asyncHandler(getOilHistories));
router.get('/vehicle/:vehicleId',      asyncHandler(getVehicleOilHistory));
router.post('/',   historyValidation,  asyncHandler(createOilHistory));
router.put('/:id',                     asyncHandler(updateOilHistory));
router.delete('/:id',                  asyncHandler(deleteOilHistory));

module.exports = router;
