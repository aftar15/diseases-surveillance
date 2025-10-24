-- AlterTable
ALTER TABLE `disease_symptoms` ADD COLUMN `severity` ENUM('mild', 'moderate', 'severe', 'critical') NOT NULL DEFAULT 'mild';
