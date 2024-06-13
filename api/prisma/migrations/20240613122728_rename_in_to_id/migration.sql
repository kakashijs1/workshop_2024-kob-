/*
  Warnings:

  - The primary key for the `BillSaleDetail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `in` on the `BillSaleDetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BillSaleDetail" DROP CONSTRAINT "BillSaleDetail_pkey",
DROP COLUMN "in",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "BillSaleDetail_pkey" PRIMARY KEY ("id");
