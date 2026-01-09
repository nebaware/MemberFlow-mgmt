-- Migration: create transportation_requests table (idempotent)

CREATE TABLE IF NOT EXISTS transportation_requests (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  pickup_location TEXT,
  delivery_location TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  price_offer DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transportation_requests_order ON transportation_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_transportation_requests_requester ON transportation_requests(requester_id);
