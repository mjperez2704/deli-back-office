-- Insertar usuario admin
INSERT INTO users (email, password_hash, full_name, phone, role) VALUES
('admin@delivery.com', '$2a$10$example_hash', 'Administrador', '+1234567890', 'admin');

-- Insertar tiendas de ejemplo
INSERT INTO stores (name, description, address, lat, lng, phone, opening_time, closing_time) VALUES
('Restaurante El Buen Sabor', 'Comida mexicana tradicional', 'Av. Principal 123, Ciudad', 19.432608, -99.133209, '+5215512345678', '09:00:00', '22:00:00'),
('Pizzería Italiana', 'Las mejores pizzas artesanales', 'Calle Roma 456, Ciudad', 19.428608, -99.138209, '+5215512345679', '12:00:00', '23:00:00'),
('Sushi Express', 'Sushi fresco y rápido', 'Av. Reforma 789, Ciudad', 19.435608, -99.135209, '+5215512345680', '11:00:00', '22:00:00');

-- Insertar productos de ejemplo
INSERT INTO products (store_id, name, description, price, category, image_url) VALUES
(1, 'Tacos al Pastor', 'Orden de 4 tacos con piña y cilantro', 85.00, 'Tacos', '/placeholder.svg?height=200&width=200'),
(1, 'Quesadillas', 'Quesadillas de queso con tortilla hecha a mano', 65.00, 'Antojitos', '/placeholder.svg?height=200&width=200'),
(2, 'Pizza Margarita', 'Pizza clásica con tomate, mozzarella y albahaca', 150.00, 'Pizzas', '/placeholder.svg?height=200&width=200'),
(2, 'Pizza Pepperoni', 'Pizza con pepperoni y queso extra', 180.00, 'Pizzas', '/placeholder.svg?height=200&width=200'),
(3, 'Sushi Roll California', 'Roll de cangrejo, aguacate y pepino', 120.00, 'Rolls', '/placeholder.svg?height=200&width=200'),
(3, 'Sashimi Variado', 'Selección de pescados frescos', 200.00, 'Sashimi', '/placeholder.svg?height=200&width=200');
