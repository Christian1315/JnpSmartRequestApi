-- CreateTable
CREATE TABLE `request_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `request_id` INTEGER NULL,
    `comment` VARCHAR(191) NOT NULL,
    `createdById` INTEGER NULL,
    `deletedById` INTEGER NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `request_attachements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `request_id` INTEGER NULL,
    `document` VARCHAR(191) NOT NULL,
    `createdById` INTEGER NULL,
    `deletedById` INTEGER NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `request_details` ADD CONSTRAINT `request_details_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request_attachements` ADD CONSTRAINT `request_attachements_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
