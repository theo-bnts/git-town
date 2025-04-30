'use client';

import { useState } from 'react';
import { UploadIcon } from '@primer/octicons-react';
import Button from '@/app/components/ui/Button';
import CrudPanel from './CrudPanel';

import getUsers from '@/app/services/api/users/getUsers';
import getUserPromotions from '@/app/services/api/users/getUserPromotions';
import deleteUser from '@/app/services/api/users/deleteUser';

import UserModal from '@/app/components/layout/forms/modal/UserModal';
import ImportUserModal from '@/app/components/layout/forms/modal/ImportUserModal';

const columns = [
  { key: 'name', title: 'Nom', sortable: true },
  { key: 'email', title: 'E-mail universitaire', sortable: true },
  { key: 'role', title: 'Rôle', sortable: true },
  { key: 'promotions', title: 'Promotion(s)', sortable: true },
];

const mapPromotion = (promo) => {
  if (promo.Diploma && promo.PromotionLevel) {
    return `${promo.Diploma.Initialism} ${promo.PromotionLevel.Initialism} – ${promo.Year}`;
  }
  return '';
};

async function fetchUsersWithPromos(token) {
  const users = await getUsers(token);
  return Promise.all(
    users.map(async u => {
      const rawPromos = await getUserPromotions(u.Id, token);
      const promos = Array.isArray(rawPromos)
        ? rawPromos.map(mapPromotion).sort()
        : [];
      return {
        raw: u,
        name: u.FullName,
        email: u.EmailAddress,
        role: u.Role?.Name || 'N/A',
        promotions: promos,
      };
    })
  );
}

const mapUserToRow = (u) => ({
  raw: {
    ...u.raw,
    promotions: u.promotions,
  },
  name: u.name,
  email: u.email,
  role: u.role,
  promotions: u.promotions,
});

export default function UsersPanel() {
  const [importOpen, setImportOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleImport = () => {
    setImportOpen(false);
    setRefreshKey(k => k + 1);
  };

  const importButton = (
    <Button
      key="import"
      variant="default_sq"
      onClick={() => setImportOpen(true)}
    >
      <UploadIcon size={24} className="text-white" />
    </Button>
  );

  return (
    <>
      <CrudPanel
        key={refreshKey}
        columns={columns}
        fetchFn={fetchUsersWithPromos}
        deleteFn={deleteUser}
        mapToRow={mapUserToRow}
        ModalComponent={UserModal}
        modalProps={{
          confirmMessage: user => (
            <>Voulez-vous vraiment supprimer <strong>{user.name}</strong> ?</>
          ),
        }}
        toolbarButtons={[importButton]}
      />

      {importOpen && (
        <ImportUserModal
          isOpen={importOpen}
          onClose={() => setImportOpen(false)}
          onImport={handleImport}
        />
      )}
    </>
  );
}
