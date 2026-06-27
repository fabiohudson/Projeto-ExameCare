-- AlterTable
ALTER TABLE "public"."Usuario" ADD COLUMN     "corTema" TEXT NOT NULL DEFAULT '#2563EB',
ADD COLUMN     "tamanhoFonte" INTEGER NOT NULL DEFAULT 16,
ADD COLUMN     "tema" TEXT NOT NULL DEFAULT 'claro';
