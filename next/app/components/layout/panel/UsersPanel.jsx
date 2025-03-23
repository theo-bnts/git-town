'use client';

import { useState, useEffect, useCallback } from 'react';
import { PencilIcon, DuplicateIcon, MarkGithubIcon } from '@primer/octicons-react';

import getUsers from '@/app/services/api/users/getUsers';
import getUserPromotions from '@/app/services/api/users/getUserPromotions';
import { getCookie } from '@/app/services/cookies';

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
        actions: [
          {
            icon: <PencilIcon size={16} />,
            onClick: () => user.onEdit && user.onEdit(),
          },
          {
            icon: <DuplicateIcon size={16} />,
            onClick: () => console.log(`Duplicate ${user.FullName}`),
          },
          {
            icon: <MarkGithubIcon size={16} />,
            onClick: () => console.log(`Github ${user.FullName}`),
          },
        ],
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
          // On associe à chaque utilisateur la fonction d'édition
          const updated = data.map((user) => ({
            ...user,
            actions: user.actions.map(action => {
              if (action.icon && action.icon.type === PencilIcon) {
                // Modification de l'action Edit pour ouvrir le modal avec les données pré-remplies
                return {
                  ...action,
                  onClick: () => {
                    setSelectedUser({
                      Id: user.raw.Id,
                      nom: user.raw.FullName,
                      email: user.raw.EmailAddress,
                      role: user.raw.Role,
                      promotions: user.rawPromotions,
                    });
                    setUserModalOpen(true);
                  },
                };
              }
              return action;
            }),
          }));
          setUsers(updated);
        });
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
