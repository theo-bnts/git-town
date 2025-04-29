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

import Table from '@/app/components/layout/table/Table';
import Button from '@/app/components/ui/Button';
import ConfirmCard from '@/app/components/ui/ConfirmCard';
import ImportUserModal from '@/app/components/layout/forms/modal/ImportUserModal';
import UserModal from '@/app/components/layout/forms/modal/UserModal';

const columns = [
  { key: 'name',       title: 'Nom',                        sortable: true },
  { key: 'email',      title: 'Adresse e-mail universitaire', sortable: true },
  { key: 'role',       title: 'Rôle',                       sortable: true },
  { key: 'promotions', title: 'Promotion(s)',              sortable: true },
  { key: 'actions',    title: 'Action(s)',                  sortable: false},
];

const mapPromotion = (promo) => {
  if (promo.Diploma && promo.PromotionLevel) {
    const value = `${promo.Diploma.Initialism} ${promo.PromotionLevel.Initialism} - ${promo.Year}`;
    return { id: promo.Id, value, full: promo };
  }
  return { id: promo.Id, value: '', full: promo };
};

const mapUser = async (user, token) => {
  const rawPromotions = await getUserPromotions(user.Id, token);
  const promotionsDisplay = Array.isArray(rawPromotions)
    ? rawPromotions
        .map(mapPromotion)
        .sort((a, b) => a.value.localeCompare(b.value))
    : [];
  return {
    raw: user,
    name: user.FullName,
    email: user.EmailAddress,
    role: user.Role?.Name || 'N/A',
    promotions: promotionsDisplay.map(p => p.value),
    rawPromotions: promotionsDisplay
  };
};

const fetchUsers = async (token) => {
  const users = await getUsers(token);
  return Promise.all(users.map(u => mapUser(u, token)));
};

export default function UsersPanel() {
  const [authToken, setAuthToken]     = useState('');
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Récupération du token
  useEffect(() => {
    (async () => {
      const t = await getCookie('token');
      setAuthToken(t);
    })();
  }, []);

  const updateActions = useCallback((user) => [
    {
      icon: <PencilIcon size={16} />,
      onClick: () => {
        setSelectedUser({
          Id: user.raw.Id,
          nom: user.name,
          email: user.email,
          role: user.role,
          promotions: user.rawPromotions,
          createdAt: user.raw.CreatedAt,
          updatedAt: user.raw.UpdatedAt
        });
        setUserModalOpen(true);
      }
    },
    {
      icon: <DuplicateIcon size={16} />, onClick: () => {}
    },
    {
      icon: <MarkGithubIcon size={16} />, onClick: () => {}
    },
    {
      icon: <TrashIcon size={16} />,
      onClick: () => {
        setUserToDelete(user);
        setConfirmOpen(true);
      }
    }
  ], []);

  // Chargement des utilisateurs + skeleton
  const refreshUsers = useCallback(() => {
    if (!authToken) return;
    setLoading(true);
    fetchUsers(authToken)
      .then(data => {
        const withActions = data.map(u => ({
          ...u,
          actions: updateActions(u)
        }));
        setUsers(withActions);
      })
      .catch(err => alert(`Erreur de chargement : ${err.message}`))
      .finally(() => setLoading(false));
  }, [authToken, updateActions]);

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
    if (!userToDelete || !authToken) return;
    try {
      await deleteUser(userToDelete.raw.Id, authToken);
      refreshUsers();
    } catch (err) {
      alert(`Erreur lors de la suppression : ${err.message}`);
    }
    setConfirmOpen(false);
    setUserToDelete(null);
  };
  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setUserToDelete(null);
  };

  return (
    <>
      <Table
        columns={columns}
        data={
          loading
            ? Array.from({ length: 3 }).map((_, i) => ({ skeleton: true, key: i }))
            : users
        }
        toolbarContents={toolbarContents}
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
              Voulez-vous vraiment supprimer <strong>{userToDelete?.name}</strong> ?
            </span>
          }
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
}
