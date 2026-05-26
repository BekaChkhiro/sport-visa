-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'NEW_CLUB_POST';

-- CreateTable
CREATE TABLE "club_posts" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" VARCHAR(5000) NOT NULL,
    "imageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_likes" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "footballerProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "club_posts_clubId_createdAt_idx" ON "club_posts"("clubId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "post_likes_postId_footballerProfileId_key" ON "post_likes"("postId", "footballerProfileId");

-- CreateIndex
CREATE INDEX "post_likes_footballerProfileId_idx" ON "post_likes"("footballerProfileId");

-- AddForeignKey
ALTER TABLE "club_posts" ADD CONSTRAINT "club_posts_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "club_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "club_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_footballerProfileId_fkey" FOREIGN KEY ("footballerProfileId") REFERENCES "footballer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
