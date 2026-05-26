-- CreateTable
CREATE TABLE "leagues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leagues_pkey" PRIMARY KEY ("id")
);

-- SeedData: common Georgian and international football leagues
INSERT INTO "leagues" ("id", "name", "country", "isActive", "orderIndex", "createdAt", "updatedAt") VALUES
  ('lg_erovnuli_liga',    'ეროვნული ლიგა',          'GE', true, 0,  NOW(), NOW()),
  ('lg_crystal',         'კრისტალი ლიგა',           'GE', true, 1,  NOW(), NOW()),
  ('lg_premier_league',  'Premier League',            'GB', true, 2,  NOW(), NOW()),
  ('lg_la_liga',         'La Liga',                   'ES', true, 3,  NOW(), NOW()),
  ('lg_bundesliga',      'Bundesliga',                'DE', true, 4,  NOW(), NOW()),
  ('lg_serie_a',         'Serie A',                   'IT', true, 5,  NOW(), NOW()),
  ('lg_ligue_1',         'Ligue 1',                   'FR', true, 6,  NOW(), NOW()),
  ('lg_champions_league','UEFA Champions League',     NULL, true, 7,  NOW(), NOW()),
  ('lg_europa_league',   'UEFA Europa League',        NULL, true, 8,  NOW(), NOW()),
  ('lg_other',           'სხვა / Other',              NULL, true, 99, NOW(), NOW());
