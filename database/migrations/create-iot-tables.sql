-- IoT Device Management Tables
-- Run this migration to add IoT device support

-- IoT Devices Table
CREATE TABLE IF NOT EXISTS iot_devices (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('soil_moisture', 'temperature', 'humidity', 'ph_sensor', 'weather_station', 'irrigation_controller')),
  farmer_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'error')),
  location JSONB,
  metadata JSONB,
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- IoT Readings Table
CREATE TABLE IF NOT EXISTS iot_readings (
  id SERIAL PRIMARY KEY,
  device_id INTEGER NOT NULL REFERENCES iot_devices(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_iot_devices_farmer ON iot_devices(farmer_id);
CREATE INDEX IF NOT EXISTS idx_iot_devices_status ON iot_devices(status);
CREATE INDEX IF NOT EXISTS idx_iot_readings_device ON iot_readings(device_id);
CREATE INDEX IF NOT EXISTS idx_iot_readings_timestamp ON iot_readings(timestamp DESC);

-- Comments
COMMENT ON TABLE iot_devices IS 'Registered IoT devices for farm monitoring';
COMMENT ON TABLE iot_readings IS 'Sensor readings from IoT devices';
COMMENT ON COLUMN iot_devices.type IS 'Type of IoT device (soil_moisture, temperature, etc.)';
COMMENT ON COLUMN iot_devices.status IS 'Current device status (online, offline, error)';
COMMENT ON COLUMN iot_devices.location IS 'Device location as JSON {latitude, longitude, address}';
COMMENT ON COLUMN iot_devices.metadata IS 'Additional device metadata as JSON';
COMMENT ON COLUMN iot_readings.data IS 'Sensor data as JSON (structure depends on device type)';
