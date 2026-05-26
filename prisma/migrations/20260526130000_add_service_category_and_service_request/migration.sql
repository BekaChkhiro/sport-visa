-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('PENDING', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ContactPreference" AS ENUM ('EMAIL', 'PHONE', 'CHAT');

-- CreateTable
CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_requests" (
    "id" TEXT NOT NULL,
    "requestCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" VARCHAR(500),
    "contactPref" "ContactPreference" NOT NULL DEFAULT 'EMAIL',
    "metadata" JSONB,
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" VARCHAR(1000),
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "service_categories_slug_key" ON "service_categories"("slug");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "service_requests_requestCode_key" ON "service_requests"("requestCode");

-- CreateIndex
CREATE INDEX "service_requests_userId_createdAt_idx" ON "service_requests"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "service_requests_status_createdAt_idx" ON "service_requests"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SeedData: default service categories
INSERT INTO "service_categories" ("id", "slug", "name", "icon", "description", "isActive", "orderIndex", "createdAt", "updatedAt") VALUES
  ('sc_meal_plan',        'meal_plan',        'Meal Plan',         '🍽',  'Nutrition and meal planning services',          true, 0, NOW(), NOW()),
  ('sc_personal_trainer', 'personal_trainer', 'Personal Trainer',  '💪',  'Individual and group training sessions',         true, 1, NOW(), NOW()),
  ('sc_team_doctor',      'team_doctor',      'Team Doctor',       '🏥',  'Medical support and injury management',          true, 2, NOW(), NOW()),
  ('sc_other',            'other',            'Other',             '···', 'Custom or miscellaneous service requests',       true, 3, NOW(), NOW());
