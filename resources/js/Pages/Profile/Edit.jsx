import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

/**
 * Profile/Edit.jsx — Pengaturan Profil Pengguna.
 * Colorful Flat Design — Cobalt Blue (#4361EE), border #E4E7EF, rounded-xl.
 */
export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout header="Pengaturan Profil">
            <Head title="Profil Pengguna" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E4E7EF]">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E4E7EF]">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E4E7EF]">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
