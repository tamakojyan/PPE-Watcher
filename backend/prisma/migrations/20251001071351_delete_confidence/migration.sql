/*
  Warnings:

  - You are about to drop the column `confidence` on the `Violation` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Violation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ts" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshotUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "handler" TEXT
);
INSERT INTO "new_Violation" ("handler", "id", "snapshotUrl", "status", "ts") SELECT "handler", "id", "snapshotUrl", "status", "ts" FROM "Violation";
DROP TABLE "Violation";
ALTER TABLE "new_Violation" RENAME TO "Violation";
CREATE INDEX "Violation_ts_idx" ON "Violation"("ts");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
