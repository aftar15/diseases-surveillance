-- DropForeignKey
ALTER TABLE `alerts` DROP FOREIGN KEY `alerts_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `disease_symptoms` DROP FOREIGN KEY `disease_symptoms_disease_id_fkey`;

-- DropForeignKey
ALTER TABLE `disease_symptoms` DROP FOREIGN KEY `disease_symptoms_symptom_id_fkey`;

-- DropForeignKey
ALTER TABLE `reports` DROP FOREIGN KEY `reports_barangay_id_fkey`;

-- DropForeignKey
ALTER TABLE `reports` DROP FOREIGN KEY `reports_disease_id_fkey`;

-- DropIndex
DROP INDEX `alerts_created_by_fkey` ON `alerts`;

-- DropIndex
DROP INDEX `disease_symptoms_symptom_id_fkey` ON `disease_symptoms`;

-- DropIndex
DROP INDEX `reports_barangay_id_fkey` ON `reports`;

-- DropIndex
DROP INDEX `reports_disease_id_fkey` ON `reports`;
