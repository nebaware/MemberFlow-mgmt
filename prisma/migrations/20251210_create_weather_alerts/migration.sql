-- Migration: create weather_alerts table (idempotent)

CREATE TABLE IF NOT EXISTS weather_alerts (
  id SERIAL PRIMARY KEY,
  region VARCHAR(255) NOT NULL,
  alert_type VARCHAR(255) NOT NULL,
  severity VARCHAR(50),
  message TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_weather_alerts_region ON weather_alerts(region);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_severity ON weather_alerts(severity);
