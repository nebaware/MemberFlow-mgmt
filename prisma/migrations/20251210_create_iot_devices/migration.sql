-- Migration: create iot_devices table (idempotent)

CREATE TABLE IF NOT EXISTS iot_devices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  device_type VARCHAR(255),
  location VARCHAR(255),
  status VARCHAR(100),
  last_reading TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_iot_devices_user ON iot_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_iot_devices_status ON iot_devices(status);
