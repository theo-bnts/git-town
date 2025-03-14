'use client';

import { useState, useEffect } from 'react';
import { PencilIcon, DuplicateIcon, MarkGithubIcon } from '@primer/octicons-react';

import getUsers from '@/app/services/api/users/getUsers';
import { getCookie } from '@/app/services/cookies';

import Table from '@/app/components/layout/table/Table';

const columns = [
  { key: 'name', title: 'Nom', sortable: true },
  { key: 'email', title: 'Adresse e-mail universitaire', sortable: true },
  { key: 'role', title: 'Rôle', sortable: true },
  { key: 'promotions', title: 'Promotion(s)', sortable: true },
  { key: 'actions', title: 'Action(s)', sortable: false },
];

const fetchUsers = async () => {
  const token = await getCookie('token');
  const users = await getUsers(token);
  const transformed = users.map((user) => ({
    name: user.FullName,
    email: user.EmailAddress,
    role: user.Role ? user.Role.Name : 'N/A',
    promotions: [],
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
  }));

  return transformed;
};

export default function UsersPanel() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers().then((data) => setUsers(data));
  }, []);

  return (
    <div className="flex flex-col flex-1">
      <Table columns={columns} data={users} />
    </div>
  );
};
