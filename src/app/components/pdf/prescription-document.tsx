
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register a nice font if needed, otherwise use default Helvetica
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' });

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#111',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    clinicName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    clinicInfo: {
        fontSize: 10,
        color: '#666',
    },
    title: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    section: {
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: 100,
        fontSize: 10,
        fontWeight: 'bold',
        color: '#555',
    },
    value: {
        fontSize: 10,
        flex: 1,
    },
    medicationList: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
    medicationItem: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 4,
    },
    medName: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    medDetails: {
        fontSize: 10,
        color: '#444',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 10,
        color: '#888',
        borderTopWidth: 1,
        borderColor: '#eee',
        paddingTop: 10,
    },
    signature: {
        marginTop: 50,
        textAlign: 'right',
        marginRight: 20,
    },
    signatureLine: {
        width: 150,
        borderTopWidth: 1,
        borderColor: '#000',
        marginBottom: 5,
        alignSelf: 'flex-end',
    },
    signatureText: {
        fontSize: 10,
        textAlign: 'right',
    }
});

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

export default function PrescriptionDocument({ data }: { data: PrescriptionData }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.clinicName}>MedFlow Clinic</Text>
                        <Text style={styles.clinicInfo}>123 Medical Center Drive</Text>
                        <Text style={styles.clinicInfo}>Tunis, Tunisia</Text>
                    </View>
                    <View>
                        <Text style={styles.clinicInfo}>Date: {new Date(data.createdAt).toLocaleDateString('fr-FR')}</Text>
                        <Text style={styles.clinicInfo}>ID: {data.id.slice(0, 8)}</Text>
                    </View>
                </View>

                <Text style={styles.title}>ORDONNANCE MÉDICALE</Text>

                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Médecin:</Text>
                        <Text style={styles.value}>Dr. {data.doctor.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Patient:</Text>
                        <Text style={styles.value}>{data.patient.name}</Text>
                    </View>
                    {data.patient.dateOfBirth && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Né(e) le:</Text>
                            <Text style={styles.value}>{new Date(data.patient.dateOfBirth).toLocaleDateString('fr-FR')}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.medicationList}>
                    {data.items.map((item, index) => (
                        <View key={index} style={styles.medicationItem}>
                            <Text style={styles.medName}>{item.name}</Text>
                            <Text style={styles.medDetails}>Dosage: {item.dosage} | Durée: {item.duration}</Text>
                            {item.instructions && <Text style={styles.medDetails}>Instructions: {item.instructions}</Text>}
                        </View>
                    ))}
                </View>

                <View style={styles.signature}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureText}>Signature & Cachet</Text>
                    <Text style={styles.signatureText}>Dr. {data.doctor.name}</Text>
                </View>

                <View style={styles.footer}>
                    <Text>MedFlow - Système de Gestion Clinique | Document généré électroniquement</Text>
                </View>
            </Page>
        </Document>
    );
}
