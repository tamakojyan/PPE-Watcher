/*
  Warnings:

  - You are about to drop the column `kinds` on the `Notification` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'violation',
    "status" TEXT NOT NULL DEFAULT 'unhandled',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" DATETIME,
    "violationId" TEXT,
    "userId" TEXT,
    "message" TEXT,
    "note" TEXT,
    CONSTRAINT "Notification_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "Violation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("createdAt", "id", "message", "note", "readAt", "status", "type", "userId", "violationId") SELECT "createdAt", "id", "message", "note", "readAt", "status", "type", "userId", "violationId" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_violationId_idx" ON "Notification"("violationId");
CREATE INDEX "Notification_status_idx" ON "Notification"("status");
CREATE INDEX "Notification_userId_status_createdAt_idx" ON "Notification"("userId", "status", "createdAt");
CREATE UNIQUE INDEX "Notification_userId_violationId_status_key" ON "Notification"("userId", "violationId", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
