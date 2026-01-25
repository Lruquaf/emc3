/*
  Warnings:

  - You are about to drop the column `slug` on the `articles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "articles_slug_key";

-- AlterTable
ALTER TABLE "articles" DROP COLUMN "slug";
