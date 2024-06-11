/*
  Warnings:

  - You are about to drop the `BillSaleDetai` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BillSaleDetai" DROP CONSTRAINT "BillSaleDetai_billSaleId_fkey";

-- DropForeignKey
ALTER TABLE "BillSaleDetai" DROP CONSTRAINT "BillSaleDetai_productId_fkey";

-- DropTable
DROP TABLE "BillSaleDetai";

-- CreateTable
CREATE TABLE "BillSaleDetail" (
    "in" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "billSaleId" INTEGER NOT NULL,
    "cost" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "BillSaleDetail_pkey" PRIMARY KEY ("in")
);

-- AddForeignKey
ALTER TABLE "BillSaleDetail" ADD CONSTRAINT "BillSaleDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillSaleDetail" ADD CONSTRAINT "BillSaleDetail_billSaleId_fkey" FOREIGN KEY ("billSaleId") REFERENCES "BillSale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
