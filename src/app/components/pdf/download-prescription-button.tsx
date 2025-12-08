"use client";

import dynamic from 'next/dynamic';
import { Button } from '@/app/components/ui/button';
import { Download } from 'lucide-react';
import type PrescriptionDocument from './prescription-document';

// Dynamic import to avoid SSR issues with react-pdf
const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => <Button variant="outline" size="sm" disabled>Chargement...</Button>,
    }
);

// Dynamic import of the document style
const PrescriptionDoc = dynamic(
    () => import('./prescription-document'),
    { ssr: false }
);

interface PrescriptionData {
    id: string;
    createdAt: Date;
    doctor: {
        name: string | null;
        email: string | null;
    };
    patient: {
        name: string;
        email: string | null;
        dateOfBirth: Date | null;
    };
    items: {
        name: string;
        dosage: string;
        duration: string;
        instructions?: string;
    }[];
}

export default function DownloadPrescriptionButton({ prescription }: { prescription: PrescriptionData }) {
    return (
        <PDFDownloadLink
            document={<PrescriptionDoc data={prescription} />}
            fileName={`ordonnance-${prescription.patient.name}-${new Date().toISOString().split('T')[0]}.pdf`}
        >
            {({ blob, url, loading, error }) => (
                <Button variant="outline" size="sm" disabled={loading}>
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? 'Génération...' : 'Télécharger PDF'}
                </Button>
            )}
        </PDFDownloadLink>
    );
}
