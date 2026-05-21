-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ACCOUNT_APPROVED', 'ACCOUNT_REJECTED', 'SERVICE_REQUEST_SUBMITTED', 'SERVICE_REQUEST_RESOLVED', 'NEW_MESSAGE', 'APPLICATION_STATUS', 'GENERAL');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('GK', 'CB', 'LB', 'RB', 'CM', 'DM', 'AM', 'LW', 'RW', 'CF', 'ST');

-- CreateEnum
CREATE TYPE "DominantFoot" AS ENUM ('RIGHT', 'LEFT', 'BOTH');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('PROFESSIONAL', 'SEMI_PROFESSIONAL', 'AMATEUR');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footballer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "nationality" TEXT,
    "city" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "bio" VARCHAR(500),
    "positions" "Position"[],
    "height" INTEGER,
    "weight" INTEGER,
    "dominantFoot" "DominantFoot",
    "currentClub" TEXT,
    "jerseyNumber" INTEGER,
    "experienceLevel" "ExperienceLevel",
    "desiredLeague" TEXT,
    "avatarKey" TEXT,
    "videoLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "profileViewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footballer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_entries" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "clubName" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "position" "Position",
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_items" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "mediaKey" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "foundedYear" INTEGER,
    "country" TEXT,
    "city" TEXT,
    "league" TEXT,
    "officialWebsite" TEXT,
    "stadiumName" TEXT,
    "stadiumCapacity" INTEGER,
    "stadiumAddress" TEXT,
    "stadiumMapUrl" TEXT,
    "logoKey" TEXT,
    "coverKey" TEXT,
    "bio" VARCHAR(2000),
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_roster_entries" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "position" TEXT,
    "jerseyNumber" INTEGER,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_roster_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_shortlists" (
    "id" TEXT NOT NULL,
    "clubProfileId" TEXT NOT NULL,
    "footballerProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_shortlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_subscriptions" (
    "id" TEXT NOT NULL,
    "footballerProfileId" TEXT NOT NULL,
    "clubProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "footballer_profiles_userId_key" ON "footballer_profiles"("userId");

-- CreateIndex
CREATE INDEX "footballer_profiles_verificationStatus_isVisible_idx" ON "footballer_profiles"("verificationStatus", "isVisible");

-- CreateIndex
CREATE INDEX "career_entries_profileId_idx" ON "career_entries"("profileId");

-- CreateIndex
CREATE INDEX "gallery_items_profileId_orderIndex_idx" ON "gallery_items"("profileId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "club_profiles_userId_key" ON "club_profiles"("userId");

-- CreateIndex
CREATE INDEX "club_profiles_verificationStatus_isVisible_idx" ON "club_profiles"("verificationStatus", "isVisible");

-- CreateIndex
CREATE INDEX "club_roster_entries_clubId_idx" ON "club_roster_entries"("clubId");

-- CreateIndex
CREATE INDEX "club_shortlists_clubProfileId_idx" ON "club_shortlists"("clubProfileId");

-- CreateIndex
CREATE INDEX "club_shortlists_footballerProfileId_idx" ON "club_shortlists"("footballerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "club_shortlists_clubProfileId_footballerProfileId_key" ON "club_shortlists"("clubProfileId", "footballerProfileId");

-- CreateIndex
CREATE INDEX "club_subscriptions_footballerProfileId_idx" ON "club_subscriptions"("footballerProfileId");

-- CreateIndex
CREATE INDEX "club_subscriptions_clubProfileId_idx" ON "club_subscriptions"("clubProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "club_subscriptions_footballerProfileId_clubProfileId_key" ON "club_subscriptions"("footballerProfileId", "clubProfileId");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footballer_profiles" ADD CONSTRAINT "footballer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_entries" ADD CONSTRAINT "career_entries_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "footballer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "footballer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_profiles" ADD CONSTRAINT "club_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_roster_entries" ADD CONSTRAINT "club_roster_entries_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "club_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_shortlists" ADD CONSTRAINT "club_shortlists_clubProfileId_fkey" FOREIGN KEY ("clubProfileId") REFERENCES "club_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_shortlists" ADD CONSTRAINT "club_shortlists_footballerProfileId_fkey" FOREIGN KEY ("footballerProfileId") REFERENCES "footballer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_subscriptions" ADD CONSTRAINT "club_subscriptions_footballerProfileId_fkey" FOREIGN KEY ("footballerProfileId") REFERENCES "footballer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_subscriptions" ADD CONSTRAINT "club_subscriptions_clubProfileId_fkey" FOREIGN KEY ("clubProfileId") REFERENCES "club_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
