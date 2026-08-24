require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Route imports
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const oilHistoryRoutes = require('./routes/oilHistory');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Routes ─────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/vehicles',    vehicleRoutes);
app.use('/api/oil-history', oilHistoryRoutes);
app.use('/api/dashboard',   dashboardRoutes);

// ─── Health check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'OliTrack API is running' });
});

// ─── Centralized Error Handler ──────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    data: null,
  });
});

// ─── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.url} not found`,
    data: null,
  });
});

app.listen(PORT, () => {
  console.log(`🛢  OliTrack API running on http://localhost:${PORT}`);
});

module.exports = app;
