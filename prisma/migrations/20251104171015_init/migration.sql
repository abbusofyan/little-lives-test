-- CreateTable
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `invoiceDate` DATETIME(3) NOT NULL,
    `totalAmount` DOUBLE NOT NULL,
    `totalTax` DOUBLE NOT NULL,
    `outstandingAmount` DOUBLE NOT NULL,
    `status` ENUM('Pending', 'PartiallyPaid', 'Paid', 'Overpaid', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Invoice_invoiceNumber_key`(`invoiceNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceItem` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `lineTotal` DOUBLE NOT NULL,
    `taxRate` DOUBLE NOT NULL,
    `taxAmount` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `paymentMethod` ENUM('Cash', 'BankTransfer', 'Card') NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `referenceNumber` VARCHAR(191) NULL,
    `status` ENUM('Pending', 'Completed', 'Failed') NOT NULL DEFAULT 'Completed',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Receipt` (
    `id` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `receiptNumber` VARCHAR(191) NOT NULL,
    `receiptDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `totalPaid` DOUBLE NOT NULL,
    `remainingBalance` DOUBLE NOT NULL,

    UNIQUE INDEX `Receipt_receiptNumber_key`(`receiptNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReceiptItem` (
    `id` VARCHAR(191) NOT NULL,
    `receiptId` VARCHAR(191) NOT NULL,
    `invoiceItemId` VARCHAR(191) NOT NULL,
    `allocatedAmount` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InvoiceItem` ADD CONSTRAINT `InvoiceItem_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Receipt` ADD CONSTRAINT `Receipt_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Receipt` ADD CONSTRAINT `Receipt_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReceiptItem` ADD CONSTRAINT `ReceiptItem_receiptId_fkey` FOREIGN KEY (`receiptId`) REFERENCES `Receipt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
