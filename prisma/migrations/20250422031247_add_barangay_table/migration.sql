-- CreateTable
CREATE TABLE `barangays` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `geometry` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_barangay_id_fkey` FOREIGN KEY (`barangay_id`) REFERENCES `barangays`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
