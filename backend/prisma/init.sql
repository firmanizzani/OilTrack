-- OliTrack Initial Migration
-- Run this if you prefer raw SQL over Prisma migrate

CREATE DATABASE IF NOT EXISTS olitrack
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE olitrack;

-- ─── users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT          NOT NULL AUTO_INCREMENT,
  email      VARCHAR(255) NOT NULL UNIQUE,
  name       VARCHAR(255) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── vehicles ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id            INT          NOT NULL AUTO_INCREMENT,
  user_id       INT          NOT NULL,
  name          VARCHAR(255) NOT NULL,
  type          ENUM('MOTORCYCLE','CAR') NOT NULL,
  license_plate VARCHAR(20)  NOT NULL UNIQUE,
  brand         VARCHAR(100) NOT NULL,
  year          SMALLINT     NOT NULL,
  icon          VARCHAR(50)  NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_vehicles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── oil_history ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS oil_history (
  id          INT            NOT NULL AUTO_INCREMENT,
  vehicle_id  INT            NOT NULL,
  change_date DATETIME       NOT NULL,
  odometer    INT            NOT NULL,
  oil_type    VARCHAR(255)   NOT NULL,
  price       DECIMAL(12,2)  NOT NULL,
  workshop    VARCHAR(255)   NOT NULL,
  notes       TEXT           NULL,
  created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_oil_history_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── reminder_settings ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reminder_settings (
  id              INT      NOT NULL AUTO_INCREMENT,
  vehicle_id      INT      NOT NULL UNIQUE,
  km_interval     INT      NOT NULL DEFAULT 3000,
  month_interval  INT      NOT NULL DEFAULT 3,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_reminder_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
