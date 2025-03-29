'use client';

import { useState, useEffect, useCallback } from 'react';
import { PencilIcon, DuplicateIcon, MarkGithubIcon, TrashIcon } from '@primer/octicons-react';

import getUsers from '@/app/services/api/users/getUsers';
import getUserPromotions from '@/app/services/api/users/getUserPromotions';
import { getCookie } from '@/app/services/cookies';
import deleteUser from '@/app/services/api/users/deleteUser';

import Table from '@/app/components/layout/table/Table';
import UserModal from '@/app/components/layout/forms/modal/UserModal';

const columns = [
  { key: 'name', title: 'Nom', sortable: true },
  { key: 'email', title: 'Adresse e-mail universitaire', sortable: true },
  { key: 'role', title: 'Rôle', sortable: true },
  { key: 'promotions', title: 'Promotion(s)', sortable: true },
  { key: 'actions', title: 'Action(s)', sortable: false },
];

const fetchUsers = async (token) => {
  const users = await getUsers(token);
  const transformed = await Promise.all(
    users.map(async (user) => {
      const rawPromotions = await getUserPromotions(user.Id, token);
      const promotionsDisplay = Array.isArray(rawPromotions)
        ? rawPromotions
            .map((promo) => {
              if (promo.Promotion) {
                const { Diploma, PromotionLevel, Year } = promo.Promotion;
                return `${Diploma.Initialism} ${PromotionLevel.Initialism} - ${Year}`;
              }
              return '';
            })
            .filter((str) => str !== '')
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
    })
  );
  return transformed;
};

export default function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [authToken, setAuthToken] = useState('');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const updateActions = (user) => [
    {
      icon: <PencilIcon size={16} />,
      onClick: () => {
        setSelectedUser({
          Id: user.raw.Id,
          nom: user.raw.FullName,
          email: user.raw.EmailAddress,
          role: user.raw.Role,
          promotions: user.rawPromotions,
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
        if (window.confirm(`Voulez-vous vraiment supprimer ${user.raw.FullName} ?`)) {
          deleteUser(user.raw.Id, authToken)
            .then(() => refreshUsers())
            .catch((error) => {
              alert(`Erreur lors de la suppression : ${error.message}`);
            });
        }
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
      fetchUsers(authToken)
        .then((data) => {
          const updated = data.map((user) => ({
            ...user,
            actions: updateActions(user),
          }));
          setUsers(updated);
        })
    }
  }, [authToken]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  return (
    <div className="flex flex-col flex-1 p-8">
      <Table 
        columns={columns} 
        data={users} 
        onUserUpdated={refreshUsers} 
        ModalComponent={UserModal}
      />
      {userModalOpen && (
        <UserModal
          isOpen={userModalOpen}
          initialData={selectedUser || {}}
          onClose={() => {
            setUserModalOpen(false);
            setSelectedUser(null);
          }}
          onUserUpdated={() => {
            refreshUsers();
            setUserModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
