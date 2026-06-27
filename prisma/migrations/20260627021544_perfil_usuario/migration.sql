-- AlterTable
ALTER TABLE "public"."Usuario" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpira" TIMESTAMP(3);
