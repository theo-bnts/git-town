"use client";

import React, { useState, useEffect } from "react";
import { Table } from "@/app/components/layouts/table";
import { PencilIcon, MarkGithubIcon } from "@primer/octicons-react";
import { getToken } from "../../config/api/token.js";
import { getUsers } from "../../config/api/users";

const columns = [
  { key: "name", title: "Nom", sortable: true },
  { key: "email", title: "Adresse e-mail universitaire", sortable: true },
  { key: "role", title: "Rôle", sortable: true },
  { key: "promotions", title: "Promotion(s)", sortable: true },
  { key: "actions", title: "Action(s)", sortable: false },
];

const UsersPage = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Récupération du token
        const tokenData = await getToken();
        const token = tokenData.token;
        if (!token) {
          throw new Error("Token non récupéré");
        }

        // Récupération des utilisateurs avec le token
        const users = await getUsers(token);

        // Transformation des données pour le composant Table
        const transformed = users.map((user) => ({
          name: user.FullName,
          email: user.EmailAddress,
          role: user.Role ? user.Role.Name : "N/A",
          promotions: [],
          actions: [
            {
              icon: <PencilIcon size={16} />,
              onClick: () => console.log(`Edit ${user.FullName}`)
            },
            {
              icon: <MarkGithubIcon size={16} />,
              onClick: () => console.log(`Github ${user.FullName}`)
            }
          ]
        }));

        setData(transformed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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
        <p className="text-red-500">Erreur: {error}</p>
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
