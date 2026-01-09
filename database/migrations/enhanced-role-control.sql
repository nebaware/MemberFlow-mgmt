-- Enhanced Role Control & Document Verification System
-- Migration: Enhanced Role Control
-- Date: December 10, 2025

-- Document verification table
CREATE TABLE IF NOT EXISTS user_documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'license', 'id_card', 'business_permit', 'tax_certificate', 'agricultural_permit'
  document_url TEXT NOT NULL,
  document_number VARCHAR(100),
  verification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'verified', 'rejected', 'expired'
  ai_confidence_score DECIMAL(3,2) DEFAULT 0.00,
  fraud_indicators JSONB DEFAULT '[]',
  extracted_data JSONB DEFAULT '{}',
  verified_by INTEGER REFERENCES users(id),
  verification_notes TEXT,
  rejection_reason TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Document verification history
CREATE TABLE IF NOT EXISTS document_verification_history (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES user_documents(id) ON DELETE CASCADE,
  previous_status VARCHAR(20) NOT NULL,
  new_status VARCHAR(20) NOT NULL,
  changed_by INTEGER REFERENCES users(id),
  change_reason TEXT,
  ai_analysis JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Role request enhancements
ALTER TABLE users ADD COLUMN IF NOT EXISTS documents_required BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_level VARCHAR(20) DEFAULT 'unverified'; -- 'unverified', 'basic', 'verified', 'premium'
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_restrictions JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_deadline TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_document_upload TIMESTAMP;

-- User verification requirements by role
CREATE TABLE IF NOT EXISTS role_document_requirements (
  id SERIAL PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role, document_type)
);

-- Fraud detection logs
CREATE TABLE IF NOT EXISTS fraud_detection_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  document_id INTEGER REFERENCES user_documents(id),
  fraud_type VARCHAR(50) NOT NULL, -- 'duplicate_document', 'fake_document', 'suspicious_pattern', 'blacklisted'
  confidence_score DECIMAL(3,2) NOT NULL,
  details JSONB DEFAULT '{}',
  action_taken VARCHAR(50), -- 'flagged', 'blocked', 'manual_review'
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Account restrictions tracking
CREATE TABLE IF NOT EXISTS account_restrictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  restriction_type VARCHAR(50) NOT NULL, -- 'no_listing', 'no_buying', 'no_services', 'suspended', 'limited_transactions'
  reason TEXT NOT NULL,
  applied_by INTEGER REFERENCES users(id),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default document requirements for each role
INSERT INTO role_document_requirements (role, document_type, is_required, description) VALUES
-- Farmer requirements
('farmer', 'id_card', TRUE, 'Government issued ID card or passport'),
('farmer', 'agricultural_permit', TRUE, 'Agricultural land use permit or certificate'),
('farmer', 'tax_certificate', FALSE, 'Tax identification certificate (optional for small farmers)'),

-- Buyer requirements  
('buyer', 'id_card', TRUE, 'Government issued ID card or passport'),
('buyer', 'business_permit', FALSE, 'Business license (required for commercial buyers)'),

-- Tool seller requirements
('tool_seller', 'id_card', TRUE, 'Government issued ID card or passport'),
('tool_seller', 'business_permit', TRUE, 'Business license for equipment sales'),
('tool_seller', 'tax_certificate', TRUE, 'Tax registration certificate'),

-- Transporter requirements
('transporter', 'id_card', TRUE, 'Government issued ID card or passport'),
('transporter', 'license', TRUE, 'Commercial driving license'),
('transporter', 'vehicle_registration', TRUE, 'Vehicle registration documents'),
('transporter', 'insurance_certificate', TRUE, 'Vehicle insurance certificate'),

-- Educator requirements
('educator', 'id_card', TRUE, 'Government issued ID card or passport'),
('educator', 'education_certificate', TRUE, 'Educational qualification certificate'),
('educator', 'teaching_permit', FALSE, 'Teaching license (if applicable)'),

-- Storage provider requirements
('storage_provider', 'id_card', TRUE, 'Government issued ID card or passport'),
('storage_provider', 'business_permit', TRUE, 'Storage facility business license'),
('storage_provider', 'facility_certificate', TRUE, 'Storage facility safety certificate'),
('storage_provider', 'tax_certificate', TRUE, 'Tax registration certificate');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_status ON user_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_user_documents_type ON user_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_user_id ON fraud_detection_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_account_restrictions_user_id ON account_restrictions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_restrictions_active ON account_restrictions(is_active);

-- Update existing users to set verification requirements
UPDATE users SET 
  documents_required = TRUE,
  verification_level = 'unverified',
  verification_deadline = NOW() + INTERVAL '30 days'
WHERE role != 'admin' AND verification_level IS NULL;

-- Add default restrictions for unverified users
UPDATE users SET 
  account_restrictions = '{
    "can_list_products": false,
    "can_offer_services": false,
    "max_transaction_amount": 1000,
    "requires_manual_approval": true
  }'::jsonb
WHERE verification_level = 'unverified' AND role != 'admin';

COMMIT;