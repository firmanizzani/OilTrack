# OliTrack 🛢️

**Full-stack web application for tracking vehicle oil change history.**

Built with React + TypeScript (frontend) and Node.js + Express + Prisma + MySQL (backend).

---

## Project Structure

```
olitrack/
├── frontend/          # React + TypeScript + Tailwind + Vite
│   └── src/
│       ├── components/
│       │   ├── ui/           # Shared UI (Modal, Toast, Skeleton, Badge)
│       │   ├── layout/       # AppLayout, Sidebar, BottomNav
│       │   ├── vehicles/     # VehicleFormModal
│       │   └── oil-history/  # OilHistoryFormModal
│       ├── pages/            # LoginPage, RegisterPage, DashboardPage, VehiclesPage,
│       │                     # VehicleDetailPage, OilHistoryPage
│       ├── services/         # API call modules (axios)
│       ├── hooks/            # useAuthStore (Zustand), useApi
│       ├── types/            # TypeScript interfaces
│       └── utils/            # cn(), formatCurrency(), etc.
│
└── backend/           # Node.js + Express + Prisma
    ├── routes/        # auth.js, vehicles.js, oilHistory.js, dashboard.js
    ├── controllers/   # authController, vehicleController, oilHistoryController, dashboardController
    ├── middleware/    # auth.js (JWT verify), helpers.js
    ├── config/        # database.js (Prisma client)
    └── prisma/        # schema.prisma, init.sql
```

---

## Prerequisites

- Node.js ≥ 18
- MySQL ≥ 8.0
- npm or pnpm

---

## Setup

### 1. Database

```bash
# Option A – Prisma migrate (recommended)
cd backend
cp .env.example .env      # Set DATABASE_URL, JWT_SECRET
npm install
npm run db:push           # Push schema to MySQL

# Option B – Raw SQL
mysql -u root -p < backend/prisma/init.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev               # Runs on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # Runs on http://localhost:5173
```

---

## API Endpoints

| Method | Route                                | Auth | Description                         |
|--------|--------------------------------------|------|-------------------------------------|
| POST   | /api/auth/register                   | ❌   | Register new user                   |
| POST   | /api/auth/login                      | ❌   | Login, returns JWT                  |
| GET    | /api/auth/me                         | ✅   | Get current user profile            |
| GET    | /api/vehicles                        | ✅   | List user's vehicles + status       |
| POST   | /api/vehicles                        | ✅   | Create vehicle                      |
| GET    | /api/vehicles/:id                    | ✅   | Get single vehicle                  |
| PUT    | /api/vehicles/:id                    | ✅   | Update vehicle + reminder settings  |
| DELETE | /api/vehicles/:id                    | ✅   | Delete vehicle (cascades)           |
| GET    | /api/oil-history                     | ✅   | List histories (filter, paginate)   |
| GET    | /api/oil-history/vehicle/:vehicleId  | ✅   | Timeline for one vehicle            |
| POST   | /api/oil-history                     | ✅   | Add oil change record               |
| PUT    | /api/oil-history/:id                 | ✅   | Update record                       |
| DELETE | /api/oil-history/:id                 | ✅   | Delete record                       |
| GET    | /api/dashboard                       | ✅   | Aggregated dashboard stats          |

### Query Parameters for `GET /api/oil-history`

| Param       | Type   | Description                   |
|-------------|--------|-------------------------------|
| vehicleId   | int    | Filter by vehicle             |
| dateFrom    | ISO    | Start date                    |
| dateTo      | ISO    | End date                      |
| workshop    | string | Partial match on workshop     |
| page        | int    | Page number (default: 1)      |
| limit       | int    | Items per page (default: 20)  |

---

## Features

- 🔐 JWT Authentication (register, login, protected routes)
- 🚗 Vehicle CRUD (motor & mobil, per-user isolation)
- 🛢️ Oil History CRUD with timeline view
- 📊 Dashboard with spending aggregation & chart (Recharts)
- 🔔 Smart Reminder badges (green/yellow/red) by km & date interval
- 🔍 Search & filter oil history via API query params
- 📱 Responsive: sidebar on desktop, bottom-nav on mobile
- ✨ Motion animations (Framer Motion), loading skeletons, toast notifications
- 🌑 Dark automotive dashboard theme

---

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="mysql://root:password@localhost:3306/olitrack"
JWT_SECRET="change-me-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
```
