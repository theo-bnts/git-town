// /app/components/layout/panel/UsersPanel.jsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { PencilIcon, DuplicateIcon, MarkGithubIcon, PlusIcon, UploadIcon } from '@primer/octicons-react';

import getUsers from '@/app/services/api/users/getUsers';
import getUserPromotions from '@/app/services/api/users/getUserPromotions';
import { getCookie } from '@/app/services/cookies';

import Button from '@/app/components/ui/Button';

import Table from '@/app/components/layout/table/Table';
import UserModal from '../forms/modal/UserModal';
import ImportUserModal from '../forms/modal/ImportUserModal';

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
      let promotions = await getUserPromotions(user.Id, token);
      const promotionsDisplay = Array.isArray(promotions)
        ? promotions
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
        name: user.FullName,
        email: user.EmailAddress,
        role: user.Role ? user.Role.Name : 'N/A',
        promotions: promotionsDisplay,
        actions: [
          {
            icon: <PencilIcon size={16} />,
            onClick: () => console.log(`Edit ${user.FullName}`),
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

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getCookie('token');
      setAuthToken(token);
    })();
  }, []);

  const refreshUsers = useCallback(() => {
    if (authToken) {
      fetchUsers(authToken)
        .then((data) => setUsers(data));
    }
  }, [authToken]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const toolbarItems = (
    <>
      <Button
        variant="default_sq"
        onClick={() => setIsUserModalOpen(true)}
      >
        <PlusIcon size={24} className="text-white" />
      </Button>
      <Button 
        variant="default_sq"
        onClick={() => setIsImportModalOpen(true)}
      >
        <UploadIcon size={24} className="text-white" />
      </Button>
    </>
  );

  return (
    <div className="flex flex-col flex-1 p-8">
      <Table 
        columns={columns} 
        data={users} 
        toolbarContent={toolbarItems}
      />

      {isUserModalOpen && (
        <UserModal
          isOpen={isUserModalOpen}
          onClose={() => {
            setIsUserModalOpen(false);
            refreshUsers();
          }}
          onUserUpdated={refreshUsers}
        />
      )}

      {isImportModalOpen && (
        <ImportUserModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onCreate={() => {/* ... */}}
        />
      )}
    </div>
  );
}