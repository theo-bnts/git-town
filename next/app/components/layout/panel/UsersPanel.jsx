// /app/components/layout/panel/UsersPanel.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  PencilIcon,
  DuplicateIcon,
  MarkGithubIcon,
  TrashIcon,
  PlusIcon,
  UploadIcon
} from '@primer/octicons-react';

import deleteUser from '@/app/services/api/users/deleteUser';
import getUsers from '@/app/services/api/users/getUsers';
import getUserPromotions from '@/app/services/api/users/getUserPromotions';
import { getCookie } from '@/app/services/cookies';

import Button from '@/app/components/ui/Button';
import ConfirmCard from '@/app/components/ui/ConfirmCard';
import ImportUserModal from '../forms/modal/ImportUserModal';
import Table from '@/app/components/layout/table/Table';
import UserModal from '@/app/components/layout/forms/modal/UserModal';

const columns = [
  { key: 'name', title: 'Nom', sortable: true },
  { key: 'email', title: 'Adresse e-mail universitaire', sortable: true },
  { key: 'role', title: 'Rôle', sortable: true },
  { key: 'promotions', title: 'Promotion(s)', sortable: true },
  { key: 'actions', title: 'Action(s)', sortable: false },
];

const mapPromotion = (promo) => {
  if (promo.Diploma && promo.PromotionLevel) {
    const value = `${promo.Diploma.Initialism} ${promo.PromotionLevel.Initialism} - ${promo.Year}`;
    return {
      id: promo.Id,
      value,
      full: {
        Diploma: { Initialism: promo.Diploma.Initialism },
        PromotionLevel: { Initialism: promo.PromotionLevel.Initialism },
        Year: promo.Year
      }
    };
  }
  return { id: promo.Id, value: '', full: {} };
};

const mapUser = async (user, token) => {
  const rawPromotions = await getUserPromotions(user.Id, token);
  const promotionsDisplay = Array.isArray(rawPromotions)
    ? rawPromotions
        .map(promo => (promo.Diploma && promo.PromotionLevel)
          ? `${promo.Diploma.Initialism} ${promo.PromotionLevel.Initialism} - ${promo.Year}`
          : '')
        .filter((str) => str !== '')
        .sort((a, b) => a.localeCompare(b))
        .join(', ')
    : '';
  return {
    raw: user,
    rawPromotions,
    name: user.FullName,
    email: user.EmailAddress,
    role: user.Role ? user.Role.Name : 'N/A',
    promotions: promotionsDisplay,
  };
};

const fetchUsers = async (token) => {
  const users = await getUsers(token);
  const transformed = await Promise.all(users.map(user => mapUser(user, token)));
  return transformed;
};

export default function UsersPanel() {
  const [authToken, setAuthToken] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const updateActions = (user) => [
    {
      icon: <PencilIcon size={16} />,
      onClick: () => {
        setSelectedUser({
          Id: user.raw.Id,
          nom: user.raw.FullName,
          email: user.raw.EmailAddress,
          role: user.raw.Role,
          promotions: Array.isArray(user.rawPromotions)
            ? user.rawPromotions.map(mapPromotion)
            : [],
          createdAt: user.raw.CreatedAt,
          updatedAt: user.raw.UpdatedAt,
        });
        setUserModalOpen(true);
      },
    },
    {
      icon: <DuplicateIcon size={16} />,
      onClick: () => console.log(`Duplicate ${user.raw.FullName}`),
    },
    {
      icon: <MarkGithubIcon size={16} />,
      onClick: () => console.log(`Github ${user.raw.FullName}`),
    },
    {
      icon: <TrashIcon size={16} />,
      onClick: () => {
        setUserToDelete(user);
        setConfirmOpen(true);
      },
    },
  ];

  useEffect(() => {
    (async () => {
      const token = await getCookie('token');
      setAuthToken(token);
    })();
  }, []);

  const refreshUsers = useCallback(() => {
    if (authToken) {
      fetchUsers(authToken).then((data) => {
        const updated = data.map((user) => ({
          ...user,
          actions: updateActions(user),
        }));
        setUsers(updated);
      });
    }
  }, [authToken]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const toolbarContents = (
    <>
      <Button variant="default_sq" onClick={() => setUserModalOpen(true)}>
        <PlusIcon size={24} className="text-white" />
      </Button>
      <Button variant="default_sq" onClick={() => setImportModalOpen(true)}>
        <UploadIcon size={24} className="text-white" />
      </Button>
    </>
  );

  const handleConfirmDelete = async () => {
    if (userToDelete && authToken) {
      try {
        await deleteUser(userToDelete.raw.Id, authToken);
        refreshUsers();
      } catch (error) {
        alert(`Erreur lors de la suppression : ${error.message}`);
      }
    }
    setConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setUserToDelete(null);
  };

  return (
    <div className="flex flex-col flex-1 p-8">
      <Table
        columns={columns}
        data={users}
        toolbarContents={toolbarContents}
        onModelUpdated={refreshUsers}
      />
      {userModalOpen && (
        <UserModal
          isOpen={userModalOpen}
          initialData={selectedUser || {}}
          onClose={() => {
            setUserModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={() => {
            refreshUsers();
            setUserModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
      {importModalOpen && (
        <ImportUserModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onImport={() => {
            refreshUsers();
            setImportModalOpen(false);
          }}
        />
      )}
      {confirmOpen && (
        <ConfirmCard
          message={
            <span>
              Voulez-vous vraiment supprimer <strong>{userToDelete?.raw.FullName}</strong> ?
            </span>
          }
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
