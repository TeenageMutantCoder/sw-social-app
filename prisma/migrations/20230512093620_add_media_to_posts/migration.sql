/*
  Warnings:

  - You are about to drop the column `mediaId` on the `Post` table. All the data in the column will be lost.
  - Added the required column `postId` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_mediaId_fkey";

-- DropIndex
DROP INDEX "Post_mediaId_key";

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "postId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "mediaId";

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
