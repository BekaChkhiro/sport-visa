-- AlterTable
ALTER TABLE "club_profiles" ADD COLUMN     "profileViewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "club_history_events" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" VARCHAR(500),
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_history_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "club_history_events_clubId_year_idx" ON "club_history_events"("clubId", "year");

-- AddForeignKey
ALTER TABLE "club_history_events" ADD CONSTRAINT "club_history_events_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "club_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
