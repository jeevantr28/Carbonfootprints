-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  monthly_goal FLOAT DEFAULT 100.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,   -- transport, food, energy, waste
  icon VARCHAR(10)
);

-- Activity logs
CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  description VARCHAR(255),
  amount FLOAT NOT NULL,          -- e.g. km driven, kWh used
  co2_kg FLOAT NOT NULL,          -- calculated CO2 equivalent
  activity_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Emission factors (used to calculate CO2)
CREATE TABLE IF NOT EXISTS emission_factors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  activity_type VARCHAR(100),     -- e.g. "car", "flight", "beef"
  co2_per_unit FLOAT NOT NULL,    -- kg CO2 per unit
  unit VARCHAR(30),               -- km, kWh, kg, etc.
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Seed Data (Insert default categories and emission factors)
INSERT IGNORE INTO categories (id, name, icon) VALUES
  (1, 'transport', '🚗'), 
  (2, 'food', '🍔'), 
  (3, 'energy', '⚡'), 
  (4, 'waste', '🗑️');

INSERT IGNORE INTO emission_factors (id, category_id, activity_type, co2_per_unit, unit) VALUES
  (1, 1, 'car',    0.21,  'km'),
  (2, 1, 'flight', 0.255, 'km'),
  (3, 1, 'bus',    0.089, 'km'),
  (4, 2, 'beef',   27.0,  'kg'),
  (5, 2, 'chicken',6.9,   'kg'),
  (6, 2, 'vegetables', 2.0, 'kg'),
  (7, 3, 'electricity', 0.233, 'kWh'),
  (8, 3, 'gas',    2.04,  'kWh'),
  (9, 4, 'waste',  0.57,  'kg');
