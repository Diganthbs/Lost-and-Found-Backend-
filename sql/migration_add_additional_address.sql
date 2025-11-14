-- Migration: Add additional_address column to items table
-- Run this if you have an existing database

USE lost_found_db;

-- Add additional_address column (if column already exists, this will fail - that's okay)
-- Check if column exists first to avoid errors
SET @dbname = DATABASE();
SET @tablename = 'items';
SET @columnname = 'additional_address';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1', -- Column exists, do nothing
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT AFTER location_id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

