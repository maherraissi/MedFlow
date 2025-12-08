import { getUsers } from '@/lib/actions';
import AddUserForm from '@/app/components/dashboard/add-user-form';
import UserActions from '@/app/components/dashboard/user-actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';

const roleLabels = {
  ADMIN: 'Administrateur',
  DOCTOR: 'Médecin',
  RECEPTIONIST: 'Réceptionniste',
  PATIENT: 'Patient'
};

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérez les membres de votre équipe et leurs accès</p>
        </div>
        <AddUserForm />
      </div>
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              {/* Status column removed as requested */}
              <TableHead>Date de création</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300' :
                      user.role === 'DOCTOR' ? 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300' :
                        user.role === 'RECEPTIONIST' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300' :
                          'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                    {roleLabels[user.role as keyof typeof roleLabels]}
                  </span>
                </TableCell>
                {/* Status cell removed */}
                <TableCell>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell>
                  <UserActions user={user} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
