-- Tabla de zonas de entrega
CREATE TABLE IF NOT EXISTS delivery_zones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  zone_type VARCHAR(20) NOT NULL CHECK (zone_type IN ('polygon', 'circle')),
  polygon_coordinates JSON,
  circle_center_lat DECIMAL(10, 8),
  circle_center_lng DECIMAL(11, 8),
  circle_radius_km DECIMAL(10, 2),
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  minimum_order DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
);

-- Tabla de configuración de pasarelas de pago
CREATE TABLE IF NOT EXISTS payment_gateways (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gateway_name VARCHAR(50) NOT NULL CHECK (gateway_name IN ('stripe', 'paypal', 'mercadopago')),
  is_active BOOLEAN DEFAULT FALSE,
  public_key TEXT,
  secret_key TEXT,
  webhook_secret TEXT,
  config JSON,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
  UNIQUE(gateway_name)
);

-- Tabla de transacciones de pago
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  gateway_name VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_method_details JSON,
  error_message TEXT,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_delivery_zones_active ON delivery_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
