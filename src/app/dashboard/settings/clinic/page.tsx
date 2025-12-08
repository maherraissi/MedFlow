import { getCurrentClinic, updateClinic } from '@/lib/actions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export default async function ClinicSettingsPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const clinic = await getCurrentClinic();
  const params = await searchParams;

  async function save(formData: FormData) {
    'use server';
    const values = {
      name: String(formData.get('name') || ''),
      email: formData.get('email') ? String(formData.get('email')) : undefined,
      phone: formData.get('phone') ? String(formData.get('phone')) : undefined,
      address: formData.get('address') ? String(formData.get('address')) : undefined,
    };
    const res = await updateClinic(values as any);
    revalidatePath('/dashboard/settings/clinic');
    if ((res as any)?.error) {
      redirect('/dashboard/settings/clinic?error=1');
    }
    redirect('/dashboard/settings/clinic?success=1');
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Réglages de la Clinique</h1>
      {params?.success && (
        <div className="mb-4 rounded bg-green-100 text-green-800 px-3 py-2 text-sm">Clinique mise à jour.</div>
      )}
      {params?.error && (
        <div className="mb-4 rounded bg-red-100 text-red-800 px-3 py-2 text-sm">Erreur lors de la mise à jour.</div>
      )}

      <form action={save} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Nom de la clinique</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={clinic?.name || ''}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={clinic?.email || ''}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Téléphone</label>
            <input
              id="phone"
              name="phone"
              type="text"
              defaultValue={clinic?.phone || ''}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1">Adresse</label>
            <input
              id="address"
              name="address"
              type="text"
              defaultValue={clinic?.address || ''}
              className="w-full rounded border px-3 py-2"
            />
          </div>
        </div>
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Enregistrer</button>
      </form>
    </div>
  );
}
