'use client';

import { useState } from 'react';
import { UploadIcon, PencilIcon, TrashIcon, MarkGithubIcon, CheckIcon, XIcon } from '@primer/octicons-react';
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
  { key: 'githubLinked', title: 'Liaison GitHub', sortable: false },
  { key: 'orgMember', title: 'Organisation rejointe', sortable: false },
];

const mapPromotion = (p) =>
  p.Diploma && p.PromotionLevel
    ? `${p.Diploma.Initialism} ${p.PromotionLevel.Initialism} - ${p.Year}`
    : '';

async function fetchUsersWithPromos(token) {
  const users = await getUsers(token);
  return Promise.all(
    users.map(async (u) => {
      const rawPromos = await getUserPromotions(u.Id, token);
      const promotions = Array.isArray(rawPromos)
        ? rawPromos.map(mapPromotion).sort()
        : [];
      return {
        raw: u,
        name: u.FullName,
        email: u.EmailAddress,
        role: u.Role?.Name || 'N/A',
        promotions,
        githubLinked: u.GitHubId
          ? <CheckIcon key={`link-${u.Id}`} size={16} className="text-[var(--accent-color)]" />
          : <XIcon key={`link-${u.Id}`} size={16} className="text-[var(--warn-color)]" />,
        orgMember: u.GitHubOrganizationMember
          ? <CheckIcon key={`org-${u.Id}`} size={16} className="text-[var(--accent-color)]" />
          : <XIcon key={`org-${u.Id}`} size={16} className="text-[var(--warn-color)]" />,
      };
    })
  );
}

const mapUserToRow = (u) => ({
  raw: { ...u.raw, promotions: u.promotions },
  name: u.name,
  email: u.email,
  role: u.role,
  promotions: u.promotions,
  githubLinked: u.githubLinked,
  orgMember: u.orgMember,
});

const actionsForRow = (row, helpers) => [
  {
    icon: <PencilIcon size={16} />,
    onClick: () => helpers.edit(row),
    variant: 'action_sq',
  },
  {
    icon: <TrashIcon size={16} />,
    onClick: () => helpers.del(row),
    variant: 'action_sq_warn',
  },
  ...(row.raw.GitHubId
    ? [{
        icon: <MarkGithubIcon size={16} />,
        onClick: () => window.open(`https://github.com/${row.raw.GitHubId}`, '_blank'),
        variant: 'action_sq',
      }]
    : []),
];

export default function UsersPanel() {
  const [importOpen, setImportOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const handleImport = () => {
    setImportOpen(false);
    setRefreshKey((k) => k + 1);
  };
  const importButton = (
    <Button key="import" variant="default_sq" onClick={() => setImportOpen(true)}>
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
          confirmMessage: (user) => (
            <>Voulez-vous vraiment supprimer <strong>{user.name}</strong> ?</>
          ),
        }}
        toolbarButtons={[importButton]}
        actionsForRow={actionsForRow}
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
