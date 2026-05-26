-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "clubUserId" TEXT NOT NULL,
    "footballerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "body" VARCHAR(2000) NOT NULL,
    "attachmentKey" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "conversations_clubUserId_footballerUserId_key" ON "conversations"("clubUserId", "footballerUserId");

-- CreateIndex
CREATE INDEX "conversations_clubUserId_idx" ON "conversations"("clubUserId");

-- CreateIndex
CREATE INDEX "conversations_footballerUserId_idx" ON "conversations"("footballerUserId");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_conversationId_read_idx" ON "messages"("conversationId", "read");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_clubUserId_fkey" FOREIGN KEY ("clubUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_footballerUserId_fkey" FOREIGN KEY ("footballerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
