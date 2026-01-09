-- Create Test Order for Payment Testing
-- Run: psql -U postgres -d azmera_db -f create-test-order.sql

-- Create test order
INSERT INTO orders (
  order_number, 
  buyer_id, 
  total_amount, 
  platform_fee,
  delivery_fee,
  net_amount,
  status, 
  payment_status,
  payment_method,
  delivery_address,
  delivery_type
)
VALUES (
  'ORD-TEST-' || FLOOR(RANDOM() * 10000)::TEXT, 
  2,  -- Buyer user (Tigist)
  1000.00,
  50.00,
  100.00,
  950.00,
  'pending', 
  'pending',
  NULL,
  'Bahir Dar, Near Stadium, Ethiopia',
  'delivery'
)
RETURNING id, order_number;

-- Get the order ID for the items
DO $$
DECLARE
  v_order_id INTEGER;
BEGIN
  -- Get the last inserted order
  SELECT id INTO v_order_id 
  FROM orders 
  WHERE order_number LIKE 'ORD-TEST-%' 
  ORDER BY created_at DESC 
  LIMIT 1;

  -- Add order items
  INSERT INTO order_items (
    order_id,
    product_id,
    seller_id,
    product_name,
    quantity,
    unit_price,
    total_price,
    seller_amount,
    platform_commission
  )
  VALUES 
  (
    v_order_id,
    1,  -- Teff Grain product
    1,  -- Seller (Abebe)
    'Teff Grain',
    10,
    100.00,
    1000.00,
    950.00,
    50.00
  );

  -- Show the created order
  RAISE NOTICE 'Test order created with ID: %', v_order_id;
END $$;

-- Display the created order
SELECT 
  id,
  order_number,
  buyer_id,
  total_amount,
  status,
  payment_status,
  'http://localhost:3000/checkout/' || id AS checkout_url
FROM orders 
WHERE order_number LIKE 'ORD-TEST-%' 
ORDER BY created_at DESC 
LIMIT 1;
