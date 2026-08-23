const { body } = require('express-validator');
const express = require('express');
const router = express.Router();
const {
  getVehicles, createVehicle, getVehicle, updateVehicle, deleteVehicle,
} = require('../controllers/vehicleController');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/helpers');

// All vehicle routes require authentication
router.use(authenticate);

const vehicleValidation = [
  body('name').trim().notEmpty().withMessage('Vehicle name is required.'),
  body('type').isIn(['MOTORCYCLE', 'CAR']).withMessage('Type must be MOTORCYCLE or CAR.'),
  body('licensePlate').trim().notEmpty().withMessage('License plate is required.'),
  body('brand').trim().notEmpty().withMessage('Brand is required.'),
  body('year').isInt({ min: 1900, max: 2100 }).withMessage('Valid year is required.'),
];

router.get('/',    asyncHandler(getVehicles));
router.post('/',   vehicleValidation, asyncHandler(createVehicle));
router.get('/:id', asyncHandler(getVehicle));
router.put('/:id', asyncHandler(updateVehicle));
router.delete('/:id', asyncHandler(deleteVehicle));

module.exports = router;
