-- Dengue Monitoring System Database Schema
-- This file can be imported directly into MySQL/phpMyAdmin

-- Create database
CREATE DATABASE IF NOT EXISTS dengue_tracker;
USE dengue_tracker;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255),
  role ENUM('admin', 'health_worker', 'researcher', 'public') NOT NULL DEFAULT 'public',
  organization VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY email_idx (email)
);

-- Dengue reports table
CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(36) PRIMARY KEY,
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  symptoms JSON NOT NULL,
  report_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'validated', 'rejected') NOT NULL DEFAULT 'pending',
  notes TEXT,
  submitted_by VARCHAR(36),
  validated_by VARCHAR(36),
  validated_at TIMESTAMP NULL,
  location_address VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX status_idx (status),
  INDEX location_idx (latitude, longitude),
  INDEX date_idx (report_date)
);

-- Hotspots table
CREATE TABLE IF NOT EXISTS hotspots (
  id VARCHAR(36) PRIMARY KEY,
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  intensity DOUBLE NOT NULL,
  report_count INT NOT NULL DEFAULT 0,
  radius DOUBLE NOT NULL DEFAULT 500,
  start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX location_idx (latitude, longitude),
  INDEX active_idx (is_active)
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  severity ENUM('info', 'warning', 'critical') NOT NULL DEFAULT 'info',
  area_type ENUM('point', 'polygon') NOT NULL DEFAULT 'point',
  area_coordinates JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  expires_at TIMESTAMP NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  INDEX severity_idx (severity),
  INDEX active_idx (is_active)
);

-- Report-to-hotspot relationship table
CREATE TABLE IF NOT EXISTS report_hotspots (
  report_id VARCHAR(36) NOT NULL,
  hotspot_id VARCHAR(36) NOT NULL,
  relation_strength DOUBLE NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (report_id, hotspot_id),
  INDEX report_idx (report_id),
  INDEX hotspot_idx (hotspot_id)
);

-- Sample data for users
INSERT INTO users (id, name, email, password, role, organization) VALUES
('1', 'Admin User', 'admin@denguetrack.org', '$2b$10$oQzPMrHx.Yhd5ULnL3XXx.C8LE2SrJ/tNIXDXvT8ReGULGDQT1wve', 'admin', 'Dengue Track Organization'),
('2', 'Health Worker', 'worker@health.gov', '$2b$10$oQzPMrHx.Yhd5ULnL3XXx.C8LE2SrJ/tNIXDXvT8ReGULGDQT1wve', 'health_worker', 'City Health Office'),
('3', 'Public User', 'public@example.com', '$2b$10$oQzPMrHx.Yhd5ULnL3XXx.C8LE2SrJ/tNIXDXvT8ReGULGDQT1wve', 'public', NULL);

-- Sample data for hotspots
INSERT INTO hotspots (id, latitude, longitude, intensity, report_count, start_date) VALUES
('1', 1.3521, 103.8198, 0.8, 24, DATE_SUB(NOW(), INTERVAL 14 DAY)),
('2', 1.3644, 103.9915, 0.6, 17, DATE_SUB(NOW(), INTERVAL 10 DAY)),
('3', 1.3097, 103.7790, 0.9, 32, DATE_SUB(NOW(), INTERVAL 7 DAY));

-- Sample data for alerts
INSERT INTO alerts (id, title, message, severity, area_type, area_coordinates, created_at, created_by, is_active) VALUES
('1', 'High dengue activity in Downtown', 'Multiple cases reported in the downtown area over the past week. Take preventive measures.', 'warning', 'point', '{"lat": 1.3521, "lng": 103.8198}', DATE_SUB(NOW(), INTERVAL 2 DAY), 'system', 1),
('2', 'Critical outbreak in Eastern District', 'Significant increase in dengue cases. Authorities are spraying insecticides and urge residents to eliminate standing water.', 'critical', 'polygon', '[{"lat": 1.3644, "lng": 103.9915}, {"lat": 1.3632, "lng": 104.0058}, {"lat": 1.3455, "lng": 104.0037}, {"lat": 1.3464, "lng": 103.9801}]', DATE_SUB(NOW(), INTERVAL 1 DAY), 'system', 1); 