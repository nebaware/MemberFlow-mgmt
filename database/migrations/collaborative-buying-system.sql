-- Collaborative Buying System
-- Migration: Group Purchase Mechanism
-- Date: December 10, 2025

-- Group purchases table
CREATE TABLE IF NOT EXISTS group_purchases (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  organizer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  total_quantity DECIMAL(10,2) NOT NULL,
  min_quantity_per_buyer DECIMAL(10,2) NOT NULL,
  max_quantity_per_buyer DECIMAL(10,2),
  unit_price DECIMAL(10,2) NOT NULL,
  target_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  total_committed_quantity DECIMAL(10,2) DEFAULT 0,
  total_committed_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'full', 'completed', 'cancelled', 'expired'
  deadline TIMESTAMP NOT NULL,
  completion_deadline TIMESTAMP,
  delivery_location TEXT,
  delivery_instructions TEXT,
  group_discount_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Group purchase participants
CREATE TABLE IF NOT EXISTS group_purchase_participants (
  id SERIAL PRIMARY KEY,
  group_purchase_id INTEGER REFERENCES group_purchases(id) ON DELETE CASCADE,
  buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'held', 'paid', 'refunded', 'failed'
  payment_transaction_id INTEGER REFERENCES transactions(id),
  escrow_transaction_id INTEGER REFERENCES transactions(id),
  delivery_preference TEXT,
  notes TEXT,
  joined_at TIMESTAMP DEFAULT NOW(),
  payment_deadline TIMESTAMP,
  UNIQUE(group_purchase_id, buyer_id)
);

-- Group purchase messages/chat
CREATE TABLE IF NOT EXISTS group_purchase_messages (
  id SERIAL PRIMARY KEY,
  group_purchase_id INTEGER REFERENCES group_purchases(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  message_type VARCHAR(20) DEFAULT 'message', -- 'message', 'system', 'announcement'
  content TEXT NOT NULL,
  is_system_message BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Group purchase notifications
CREATE TABLE IF NOT EXISTS group_purchase_notifications (
  id SERIAL PRIMARY KEY,
  group_purchase_id INTEGER REFERENCES group_purchases(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- 'new_participant', 'group_full', 'deadline_reminder', 'completion', 'cancellation'
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bulk order templates (for recurring group purchases)
CREATE TABLE IF NOT EXISTS bulk_order_templates (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_category VARCHAR(100),
  template_name VARCHAR(200) NOT NULL,
  description TEXT,
  typical_quantity DECIMAL(10,2),
  typical_participants INTEGER,
  recurring_schedule VARCHAR(50), -- 'weekly', 'monthly', 'seasonal', 'custom'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Buyer matching preferences
CREATE TABLE IF NOT EXISTS buyer_matching_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  preferred_categories JSONB DEFAULT '[]',
  max_budget_per_purchase DECIMAL(10,2),
  preferred_delivery_locations JSONB DEFAULT '[]',
  notification_preferences JSONB DEFAULT '{}',
  auto_join_criteria JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Group purchase reviews and ratings
CREATE TABLE IF NOT EXISTS group_purchase_reviews (
  id SERIAL PRIMARY KEY,
  group_purchase_id INTEGER REFERENCES group_purchases(id) ON DELETE CASCADE,
  reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  organizer_rating INTEGER CHECK (organizer_rating >= 1 AND organizer_rating <= 5),
  product_quality_rating INTEGER CHECK (product_quality_rating >= 1 AND product_quality_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  overall_experience_rating INTEGER CHECK (overall_experience_rating >= 1 AND overall_experience_rating <= 5),
  review_text TEXT,
  would_join_again BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_purchase_id, reviewer_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_purchases_product_id ON group_purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_group_purchases_organizer_id ON group_purchases(organizer_id);
CREATE INDEX IF NOT EXISTS idx_group_purchases_status ON group_purchases(status);
CREATE INDEX IF NOT EXISTS idx_group_purchases_deadline ON group_purchases(deadline);
CREATE INDEX IF NOT EXISTS idx_group_purchase_participants_group_id ON group_purchase_participants(group_purchase_id);
CREATE INDEX IF NOT EXISTS idx_group_purchase_participants_buyer_id ON group_purchase_participants(buyer_id);
CREATE INDEX IF NOT EXISTS idx_group_purchase_participants_payment_status ON group_purchase_participants(payment_status);
CREATE INDEX IF NOT EXISTS idx_group_purchase_messages_group_id ON group_purchase_messages(group_purchase_id);
CREATE INDEX IF NOT EXISTS idx_group_purchase_notifications_user_id ON group_purchase_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_buyer_matching_preferences_user_id ON buyer_matching_preferences(user_id);

-- Add triggers for automatic updates
CREATE OR REPLACE FUNCTION update_group_purchase_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update group purchase statistics when participants change
  UPDATE group_purchases SET
    current_participants = (
      SELECT COUNT(*) 
      FROM group_purchase_participants 
      WHERE group_purchase_id = COALESCE(NEW.group_purchase_id, OLD.group_purchase_id)
      AND payment_status IN ('held', 'paid')
    ),
    total_committed_quantity = (
      SELECT COALESCE(SUM(quantity), 0)
      FROM group_purchase_participants 
      WHERE group_purchase_id = COALESCE(NEW.group_purchase_id, OLD.group_purchase_id)
      AND payment_status IN ('held', 'paid')
    ),
    total_committed_amount = (
      SELECT COALESCE(SUM(total_amount), 0)
      FROM group_purchase_participants 
      WHERE group_purchase_id = COALESCE(NEW.group_purchase_id, OLD.group_purchase_id)
      AND payment_status IN ('held', 'paid')
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.group_purchase_id, OLD.group_purchase_id);
  
  -- Check if group is now full
  UPDATE group_purchases SET
    status = CASE 
      WHEN current_participants >= target_participants THEN 'full'
      WHEN current_participants > 0 AND status = 'full' AND current_participants < target_participants THEN 'open'
      ELSE status
    END
  WHERE id = COALESCE(NEW.group_purchase_id, OLD.group_purchase_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_group_purchase_stats ON group_purchase_participants;
CREATE TRIGGER trigger_update_group_purchase_stats
  AFTER INSERT OR UPDATE OR DELETE ON group_purchase_participants
  FOR EACH ROW EXECUTE FUNCTION update_group_purchase_stats();

-- Function to automatically expire group purchases
CREATE OR REPLACE FUNCTION expire_group_purchases()
RETURNS void AS $$
BEGIN
  -- Mark expired group purchases
  UPDATE group_purchases SET
    status = 'expired',
    updated_at = NOW()
  WHERE status IN ('open', 'full') 
    AND deadline < NOW();
  
  -- Refund participants of expired group purchases
  UPDATE group_purchase_participants SET
    payment_status = 'refunded'
  WHERE group_purchase_id IN (
    SELECT id FROM group_purchases WHERE status = 'expired'
  ) AND payment_status = 'held';
END;
$$ LANGUAGE plpgsql;

-- Insert sample bulk order templates
INSERT INTO bulk_order_templates (creator_id, product_category, template_name, description, typical_quantity, typical_participants, recurring_schedule) VALUES
(1, 'Grains', 'Monthly Teff Group Buy', 'Monthly group purchase of premium teff grain', 500.00, 10, 'monthly'),
(1, 'Coffee', 'Seasonal Coffee Bean Bulk Order', 'Seasonal bulk purchase of coffee beans directly from farmers', 200.00, 8, 'seasonal'),
(1, 'Vegetables', 'Weekly Fresh Vegetable Box', 'Weekly group order for fresh seasonal vegetables', 100.00, 15, 'weekly'),
(1, 'Fruits', 'Mango Season Group Purchase', 'Group buying during mango harvest season', 300.00, 12, 'seasonal');

-- Insert sample buyer matching preferences
INSERT INTO buyer_matching_preferences (user_id, preferred_categories, max_budget_per_purchase, preferred_delivery_locations, notification_preferences, auto_join_criteria) VALUES
(2, '["Grains", "Coffee", "Spices"]', 5000.00, '["Addis Ababa", "Bahir Dar"]', '{"email": true, "sms": false, "push": true}', '{"max_price_per_kg": 100, "min_participants": 5}'),
(3, '["Vegetables", "Fruits"]', 2000.00, '["Addis Ababa"]', '{"email": true, "sms": true, "push": true}', '{"max_price_per_kg": 50, "min_participants": 8}');

COMMIT;