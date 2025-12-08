// src/components/ConsultationForm.tsx

"use client";

import { useState } from "react";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export default function ConsultationForm({ appointmentId }: { appointmentId: string }) {
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", frequency: "", duration: "" },
  ]);
  const [loading, setLoading] = useState(false);

  const addMedication = () => {
    setMedications([
      ...medications,
      { name: "", dosage: "", frequency: "", duration: "" },
    ]);
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          diagnosis,
          treatment,
          notes,
          medications: medications.filter((m) => m.name),
        }),
      });

      if (response.ok) {
        alert("Consultation enregistrée avec succès!");
        window.location.reload();
      } else {
        alert("Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Diagnostic */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Diagnostic *
        </label>
        <textarea
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="Décrivez le diagnostic..."
          required
        />
      </div>

      {/* Traitement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Traitement recommandé
        </label>
        <textarea
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="Décrivez le traitement..."
        />
      </div>

      {/* Médicaments */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Médicaments prescrits
          </label>
          <button
            onClick={addMedication}
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            + Ajouter
          </button>
        </div>

        <div className="space-y-3">
          {medications.map((med, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 p-3 bg-gray-50 rounded-lg">
              <input
                placeholder="Nom"
                value={med.name}
                onChange={(e) => updateMedication(index, "name", e.target.value)}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <input
                placeholder="Posologie"
                value={med.dosage}
                onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <input
                placeholder="Fréquence"
                value={med.frequency}
                onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <div className="flex gap-2">
                <input
                  placeholder="Durée"
                  value={med.duration}
                  onChange={(e) => updateMedication(index, "duration", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => removeMedication(index)}
                  className="px-2 text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes additionnelles
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="Notes privées..."
        />
      </div>

      {/* Bouton de soumission */}
      <button
        onClick={handleSubmit}
        disabled={loading || !diagnosis}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : "Enregistrer la consultation"}
      </button>
    </div>
  );
}