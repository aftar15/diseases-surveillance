/*
  Warnings:

  - You are about to drop the `barangays` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `reporterName` to the `reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reporterNumber` to the `reports` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `reports` DROP FOREIGN KEY `reports_barangay_id_fkey`;

-- DropIndex
DROP INDEX `reports_barangay_id_fkey` ON `reports`;

-- AlterTable
ALTER TABLE `reports` ADD COLUMN `reporterName` VARCHAR(191) NOT NULL,
    ADD COLUMN `reporterNumber` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `barangays`;
