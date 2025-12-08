"use client";

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from '@/app/components/ui/button';

export default function PrescriptionPDF({ consultation }: { consultation: any }) {
  const generatePDF = () => {
    const doc = new jsPDF();

    // En-tête
    doc.setFontSize(20);
    doc.text("Ordonnance Médicale", 105, 20, { align: 'center' });

    // Informations Patient
    doc.setFontSize(12);
    doc.text(`Patient: ${consultation.patient.name}`, 14, 40);
    doc.text(`Date: ${new Date(consultation.createdAt).toLocaleDateString()}`, 14, 46);
    doc.text(`Médecin: ${consultation.doctor.name}`, 14, 52);

    // Table des médicaments
    const tableColumn = ["Médicament", "Dosage", "Durée", "Instructions"];
    const tableRows: any[] = [];

    consultation.prescriptions.forEach((p: any) => {
      try {
        const items = JSON.parse(p.items);
        items.forEach((item: any) => {
          const row = [item.name, item.dosage, item.duration, item.instructions || ''];
          tableRows.push(row);
        });
      } catch (e) {
        console.error("Failed to parse prescription items:", e);
      }
    });

    (doc as any).autoTable(tableColumn, tableRows, { startY: 60 });

    // Pied de page
    doc.setFontSize(10);
    doc.text("Signature du médecin", 14, (doc as any).lastAutoTable.finalY + 20);

    doc.save(`ordonnance-${consultation.patient.name.replace(/ /g, '_')}.pdf`);
  };

  return <Button onClick={generatePDF}>Exporter en PDF</Button>;
}
