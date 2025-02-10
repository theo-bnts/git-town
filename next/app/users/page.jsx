"use client";

import React, { useState, useEffect } from "react";
import { Table } from "@/app/components/layouts/table";
import { PencilIcon, MarkGithubIcon } from "@primer/octicons-react";

const columns = [
  { key: "name", title: "Nom", sortable: true },
  { key: "email", title: "Adresse e-mail universitaire", sortable: true },
  { key: "role", title: "Rôle", sortable: true },
  { key: "promotions", title: "Promotion(s)", sortable: true },
  { key: "actions", title: "Action(s)", sortable: false },
];

const UsersPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
        if (!res.ok) {
          throw new Error(`Erreur ${res.status} : ${res.statusText}`);
        }
        const users = await res.json();
        const transformed = users.map((user) => ({
          name: user.name,
          email: user.email,
          role: user.role,
          promotions: user.promotions,
          actions: [
            {
              icon: <PencilIcon size={16} />,
              onClick: () => console.log(`Edit ${user.name}`),
            },
            {
              icon: <MarkGithubIcon size={16} />,
              onClick: () => console.log(`Github ${user.name}`),
            },
          ],
        }));
        setData(transformed);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-600">
          {error.message || "Une erreur est survenue."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Table columns={columns} data={data} />
    </div>
  );
};

export default UsersPage;
