// src/lib/pdf-generator.ts
// Générateur de PDFs pour ordonnances et factures

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ============= PRESCRIPTION PDF =============

interface PrescriptionData {
  clinicName: string;
  clinicAddress?: string;
  clinicPhone?: string;
  patientName: string;
  patientDOB?: string;
  doctorName: string;
  doctorLicense?: string;
  date: Date;
  items: Array<{
    name: string;
    dosage: string;
    duration: string;
    instructions?: string;
  }>;
  diagnosis?: string;
  notes?: string;
}

export function generatePrescriptionPDF(data: PrescriptionData): string {
  const doc = new jsPDF();
  const primaryColor = [102, 126, 234]; // Indigo
  const darkColor = [0, 0, 0];
  let yPos = 15;

  // ===== EN-TÊTE =====
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text("ORDONNANCE MÉDICALE", 105, yPos, { align: "center" });
  yPos += 10;

  // Clinique info
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  doc.text(data.clinicName, 20, yPos);
  yPos += 5;
  if (data.clinicAddress) {
    doc.setFontSize(9);
    doc.text(data.clinicAddress, 20, yPos);
    yPos += 4;
  }
  if (data.clinicPhone) {
    doc.text(`Tel: ${data.clinicPhone}`, 20, yPos);
    yPos += 4;
  }

  // Ligne de séparation
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 8;

  // Date et numéro
  const dateStr = new Date(data.date).toLocaleDateString("fr-FR");
  doc.setFontSize(10);
  doc.text(`Date: ${dateStr}`, 150, yPos);
  yPos += 5;

  // Médecin
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text("Médecin:", 20, yPos);
  doc.setTextColor(...darkColor);
  doc.text(data.doctorName, 50, yPos);
  yPos += 5;
  if (data.doctorLicense) {
    doc.setFontSize(9);
    doc.text(`Licence: ${data.doctorLicense}`, 50, yPos);
    yPos += 4;
  }

  yPos += 4;

  // Patient
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text("Patient:", 20, yPos);
  doc.setTextColor(...darkColor);
  doc.text(data.patientName, 50, yPos);
  yPos += 5;
  if (data.patientDOB) {
    doc.setFontSize(9);
    doc.text(`DOB: ${data.patientDOB}`, 50, yPos);
    yPos += 4;
  }

  yPos += 4;

  // Diagnostic
  if (data.diagnosis) {
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text("Diagnostic:", 20, yPos);
    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    const diagLines = doc.splitTextToSize(data.diagnosis, 170);
    doc.text(diagLines, 20, yPos);
    yPos += diagLines.length * 4 + 4;
  }

  // Médicaments
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text("MÉDICAMENTS PRESCRITS:", 20, yPos);
  yPos += 7;

  autoTable(doc, {
    startY: yPos,
    head: [["Médicament", "Posologie", "Durée", "Instructions"]],
    body: data.items.map((item) => [
      item.name,
      item.dosage,
      item.duration,
      item.instructions || "-",
    ]),
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3,
    },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Notes supplémentaires
  if (data.notes) {
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text("Notes:", 20, yPos);
    yPos += 5;
    doc.setFontSize(9);
    doc.setTextColor(...darkColor);
    const noteLines = doc.splitTextToSize(data.notes, 170);
    doc.text(noteLines, 20, yPos);
    yPos += noteLines.length * 4 + 5;
  }

  // Signature
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text("Signature du médecin:", 120, yPos);
  doc.line(120, yPos + 12, 190, yPos + 12);

  // Footer
  yPos = 280;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.line(20, yPos - 5, 190, yPos - 5);
  doc.text("Ce document est une ordonnance médicale officielle générée par MedFlow SaaS", 105, yPos, {
    align: "center",
  });

  return doc.output("dataurlstring");
}

// ============= INVOICE PDF =============

interface InvoiceData {
  clinicName: string;
  clinicAddress?: string;
  clinicPhone?: string;
  invoiceNumber: string;
  date: Date;
  dueDate?: Date;
  patientName: string;
  patientEmail?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
}

export function generateInvoicePDF(data: InvoiceData): string {
  const doc = new jsPDF();
  const primaryColor = [102, 126, 234];
  const darkColor = [0, 0, 0];
  let yPos = 15;

  // ===== EN-TÊTE =====
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text("FACTURE", 105, yPos, { align: "center" });
  yPos += 10;

  // Clinique info (gauche)
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  doc.text(data.clinicName, 20, yPos);
  yPos += 5;
  if (data.clinicAddress) {
    doc.setFontSize(9);
    doc.text(data.clinicAddress, 20, yPos);
    yPos += 4;
  }
  if (data.clinicPhone) {
    doc.text(`Tel: ${data.clinicPhone}`, 20, yPos);
    yPos += 4;
  }

  // Numéro et dates (droite)
  yPos = 25;
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text(`Facture N°: ${data.invoiceNumber}`, 130, yPos);
  yPos += 5;
  doc.text(`Date: ${new Date(data.date).toLocaleDateString("fr-FR")}`, 130, yPos);
  yPos += 5;
  if (data.dueDate) {
    doc.text(`Échéance: ${new Date(data.dueDate).toLocaleDateString("fr-FR")}`, 130, yPos);
  }

  // Ligne de séparation
  yPos = 45;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 8;

  // Client
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text("FACTURÉ À:", 20, yPos);
  yPos += 5;
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text(data.patientName, 20, yPos);
  yPos += 4;
  if (data.patientEmail) {
    doc.setFontSize(9);
    doc.text(data.patientEmail, 20, yPos);
    yPos += 4;
  }

  yPos += 6;

  // Tableau des articles
  autoTable(doc, {
    startY: yPos,
    head: [["Description", "Quantité", "Prix Unitaire", "Total"]],
    body: data.items.map((item) => [
      item.description,
      item.quantity.toString(),
      `€${item.unitPrice.toFixed(2)}`,
      `€${(item.quantity * item.unitPrice).toFixed(2)}`,
    ]),
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    margin: { left: 20, right: 20 },
  });

  // Total
  yPos = (doc as any).lastAutoTable.finalY + 10;
  const total = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text("TOTAL:", 150, yPos);
  doc.setFontSize(12);
  doc.setTextColor(...darkColor);
  doc.text(`€${total.toFixed(2)}`, 180, yPos, { align: "right" });

  // Notes
  if (data.notes) {
    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text("Notes:", 20, yPos);
    yPos += 5;
    doc.setFontSize(9);
    doc.setTextColor(...darkColor);
    const noteLines = doc.splitTextToSize(data.notes, 170);
    doc.text(noteLines, 20, yPos);
  }

  // Footer
  yPos = 280;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.line(20, yPos - 5, 190, yPos - 5);
  doc.text("Merci pour votre confiance. Générée par MedFlow SaaS", 105, yPos, {
    align: "center",
  });

  return doc.output("dataurlstring");
}
