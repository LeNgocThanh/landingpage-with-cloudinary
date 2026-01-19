-- CreateTable
CREATE TABLE "ImageItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "anchor" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ImageItem_anchor_key" ON "ImageItem"("anchor");

-- CreateIndex
CREATE INDEX "ImageItem_position_idx" ON "ImageItem"("position");
