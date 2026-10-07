-- CreateTable
CREATE TABLE "Pais" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contacto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "provinciaId" INTEGER NOT NULL,
    "paisId" INTEGER,
    CONSTRAINT "Contacto_provinciaId_fkey" FOREIGN KEY ("provinciaId") REFERENCES "Provincia" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Contacto_paisId_fkey" FOREIGN KEY ("paisId") REFERENCES "Pais" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Contacto" ("email", "id", "nombre", "provinciaId", "telefono") SELECT "email", "id", "nombre", "provinciaId", "telefono" FROM "Contacto";
DROP TABLE "Contacto";
ALTER TABLE "new_Contacto" RENAME TO "Contacto";
CREATE TABLE "new_Provincia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "paisId" INTEGER,
    CONSTRAINT "Provincia_paisId_fkey" FOREIGN KEY ("paisId") REFERENCES "Pais" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Provincia" ("id", "nombre") SELECT "id", "nombre" FROM "Provincia";
DROP TABLE "Provincia";
ALTER TABLE "new_Provincia" RENAME TO "Provincia";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
