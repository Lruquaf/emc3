-- AlterTable
ALTER TABLE "opinion_replies" ADD COLUMN     "removed_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "opinion_replies_removed_at_idx" ON "opinion_replies"("removed_at");
