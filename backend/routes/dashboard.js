const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/helpers');

router.get('/', authenticate, asyncHandler(getDashboard));

module.exports = router;
