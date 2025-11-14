-- create DB
CREATE DATABASE IF NOT EXISTS lost_found_db;
USE lost_found_db;

-- users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- locations
CREATE TABLE IF NOT EXISTS locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- items
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category_id INT,
  location_id INT,
  additional_address TEXT,
  reported_date DATE NOT NULL,
  photo_url VARCHAR(500),
  status ENUM('lost','found') DEFAULT 'lost',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- responses
CREATE TABLE IF NOT EXISTS responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  responder_id INT NOT NULL,
  message TEXT NOT NULL,
  contact_info VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  seen_by_owner BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE CASCADE
);

-- seed categories and locations (only insert if not exist)
INSERT IGNORE INTO categories (name) VALUES ('Wallet'),('Phone'),('Bag'),('Keys'),('Clothing'),('Other');
INSERT IGNORE INTO locations (name) VALUES ('Campus'),('Bus Stand'),('Metro'),('Office'),('Mall'),('Other');































-- -- Run: CREATE DATABASE lost_found_db; USE lost_found_db;

-- CREATE TABLE users (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(100) NOT NULL,
--   email VARCHAR(150) NOT NULL UNIQUE,
--   password_hash VARCHAR(255) NOT NULL,
--   phone VARCHAR(20),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE categories (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(50) NOT NULL UNIQUE
-- );

-- CREATE TABLE locations (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(100) NOT NULL UNIQUE
-- );

-- CREATE TABLE items (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   user_id INT NOT NULL,
--   title VARCHAR(200) NOT NULL,
--   description TEXT,
--   category_id INT,
--   location_id INT,
--   reported_date DATE NOT NULL,
--   photo_url VARCHAR(500),
--   status ENUM('lost','found') DEFAULT 'lost',
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--   FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
--   FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
-- );

-- CREATE TABLE responses (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   item_id INT NOT NULL,
--   responder_id INT NOT NULL,
--   message TEXT NOT NULL,
--   contact_info VARCHAR(200),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   seen_by_owner BOOLEAN DEFAULT FALSE,
--   FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
--   FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- -- seed categories and locations
-- INSERT INTO categories (name) VALUES ('Wallet'),('Phone'),('Bag'),('Keys'),('Clothing'),('Other');
-- INSERT INTO locations (name) VALUES ('Campus'),('Bus Stand'),('Metro'),('Office'),('Mall'),('Other');


