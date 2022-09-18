-- CreateTable
CREATE TABLE "LocalUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "LocalUser_name_key" ON "LocalUser"("name");
