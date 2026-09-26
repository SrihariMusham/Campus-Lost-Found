-- Lost & Found Portal database schema
-- MySQL 8+

CREATE DATABASE IF NOT EXISTS lost_found_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lost_found_db;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lost_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(255) NOT NULL,
  date DATETIME NOT NULL,
  description TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,
  owner_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lost_items_date (date),
  KEY idx_lost_items_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS found_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(255) NOT NULL,
  date DATETIME NOT NULL,
  description TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,
  image VARCHAR(255) NULL,
  phone VARCHAR(30) NOT NULL,
  owner_name VARCHAR(150) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_found_items_date (date),
  KEY idx_found_items_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS claims (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  item_id INT UNSIGNED NOT NULL,
  type ENUM('lost', 'found') NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  name VARCHAR(150) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  admin_remarks TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_claims_status (status),
  KEY idx_claims_item (item_id)
) ENGINE=InnoDB;
