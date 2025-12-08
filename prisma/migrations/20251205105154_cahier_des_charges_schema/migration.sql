/*
  Warnings:

  - The values [SCHEDULED,IN_PROGRESS,NO_SHOW] on the enum `AppointmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING] on the enum `InvoiceStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `date` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `treatment` on the `consultations` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `instructions` on the `prescriptions` table. All the data in the column will be lost.
  - You are about to drop the column `issuedDate` on the `prescriptions` table. All the data in the column will be lost.
  - You are about to drop the column `medications` on the `prescriptions` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `medical_records` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenants` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `clinicId` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endAt` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startAt` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorId` to the `consultations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientId` to the `consultations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicId` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicId` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorId` to the `prescriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `items` to the `prescriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `prescriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicId` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationMinutes` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'MANUAL', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- AlterEnum
BEGIN;
CREATE TYPE "AppointmentStatus_new" AS ENUM ('BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."appointments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "AppointmentStatus_new" USING ("status"::text::"AppointmentStatus_new");
ALTER TYPE "AppointmentStatus" RENAME TO "AppointmentStatus_old";
ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
DROP TYPE "public"."AppointmentStatus_old";
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'BOOKED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "InvoiceStatus_new" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');
ALTER TABLE "public"."invoices" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "invoices" ALTER COLUMN "status" TYPE "InvoiceStatus_new" USING ("status"::text::"InvoiceStatus_new");
ALTER TYPE "InvoiceStatus" RENAME TO "InvoiceStatus_old";
ALTER TYPE "InvoiceStatus_new" RENAME TO "InvoiceStatus";
DROP TYPE "public"."InvoiceStatus_old";
ALTER TABLE "invoices" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_patientId_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_patientId_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "medical_records" DROP CONSTRAINT "medical_records_patientId_fkey";

-- DropForeignKey
ALTER TABLE "patients" DROP CONSTRAINT "patients_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_tenantId_fkey";

-- DropIndex
DROP INDEX "appointments_date_idx";

-- DropIndex
DROP INDEX "appointments_tenantId_idx";

-- DropIndex
DROP INDEX "invoices_tenantId_idx";

-- DropIndex
DROP INDEX "patients_tenantId_idx";

-- DropIndex
DROP INDEX "services_tenantId_idx";

-- DropIndex
DROP INDEX "users_tenantId_idx";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "date",
DROP COLUMN "tenantId",
ADD COLUMN     "clinicId" TEXT NOT NULL,
ADD COLUMN     "endAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'BOOKED';

-- AlterTable
ALTER TABLE "consultations" DROP COLUMN "treatment",
ADD COLUMN     "doctorId" TEXT NOT NULL,
ADD COLUMN     "patientId" TEXT NOT NULL,
ALTER COLUMN "diagnosis" DROP NOT NULL;

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "amount",
DROP COLUMN "paymentMethod",
DROP COLUMN "tenantId",
ADD COLUMN     "clinicId" TEXT NOT NULL,
ADD COLUMN     "items" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "stripeSessionId" TEXT,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "appointmentId" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'DRAFT',
ALTER COLUMN "dueDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "birthDate",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "notes",
DROP COLUMN "tenantId",
ADD COLUMN     "clinicId" TEXT NOT NULL,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "medicalHistory" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "prescriptions" DROP COLUMN "instructions",
DROP COLUMN "issuedDate",
DROP COLUMN "medications",
ADD COLUMN     "doctorId" TEXT NOT NULL,
ADD COLUMN     "items" TEXT NOT NULL,
ADD COLUMN     "pdfUrl" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "active",
DROP COLUMN "duration",
DROP COLUMN "tenantId",
ADD COLUMN     "clinicId" TEXT NOT NULL,
ADD COLUMN     "durationMinutes" INTEGER NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "active",
DROP COLUMN "tenantId",
ADD COLUMN     "clinicId" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT;

-- DropTable
DROP TABLE "medical_records";

-- DropTable
DROP TABLE "tenants";

-- CreateTable
CREATE TABLE "clinics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripePaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "changes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payments_invoiceId_idx" ON "payments"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_stripePaymentId_idx" ON "payments"("stripePaymentId");

-- CreateIndex
CREATE INDEX "audit_logs_clinicId_idx" ON "audit_logs"("clinicId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_resourceType_idx" ON "audit_logs"("resourceType");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "appointments_clinicId_idx" ON "appointments"("clinicId");

-- CreateIndex
CREATE INDEX "appointments_startAt_idx" ON "appointments"("startAt");

-- CreateIndex
CREATE INDEX "consultations_appointmentId_idx" ON "consultations"("appointmentId");

-- CreateIndex
CREATE INDEX "consultations_patientId_idx" ON "consultations"("patientId");

-- CreateIndex
CREATE INDEX "consultations_doctorId_idx" ON "consultations"("doctorId");

-- CreateIndex
CREATE INDEX "invoices_clinicId_idx" ON "invoices"("clinicId");

-- CreateIndex
CREATE INDEX "patients_clinicId_idx" ON "patients"("clinicId");

-- CreateIndex
CREATE INDEX "prescriptions_doctorId_idx" ON "prescriptions"("doctorId");

-- CreateIndex
CREATE INDEX "services_clinicId_idx" ON "services"("clinicId");

-- CreateIndex
CREATE INDEX "users_clinicId_idx" ON "users"("clinicId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
