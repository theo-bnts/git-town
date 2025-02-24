"use client";

import React, { useState, useEffect } from "react";
import Table from "@/app/components/layout/table/Table";
import { PencilIcon, MarkGithubIcon, DuplicateIcon } from "@primer/octicons-react";
import { getUserIdByEmail, getToken } from "@/config/api/token";
import { getUsers } from "@/config/api/users";

const columns = [
  { key: "name", title: "Nom", sortable: true },
  { key: "email", title: "Adresse e-mail universitaire", sortable: true },
  { key: "role", title: "Rôle", sortable: true },
  { key: "promotions", title: "Promotion(s)", sortable: true },
  { key: "actions", title: "Action(s)", sortable: false },
];

const UsersPage = () => {
  // Données de ta table
  const [data, setData] = useState([]);
  // Gestion d’erreurs et état de chargement
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Par exemple, on définit en dur un email + un mot de passe pour démo
  // (en pratique, tu pourrais faire un formulaire d'authentification)
  const userEmail = "anne.lapujade@u-picardie.fr";
  const userPassword = "anne.lapujade@u-picardie.fr";

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Récupérer l’ID de l’utilisateur via son email
        const userId = await getUserIdByEmail(userEmail);

        // 2. Appeler POST /users/:id/token avec le mot de passe
        const token = await getToken(userId, userPassword);
        if (!token) {
          throw new Error("Le token est introuvable dans la réponse");
        }

        // 3. Récupérer la liste de tous les utilisateurs avec le token
        const users = await getUsers(token);

        // 4. Transformer les données pour ton tableau
        const transformed = users.map((user) => ({
          name: user.FullName,
          email: user.EmailAddress,
          role: user.Role ? user.Role.Name : "N/A",
          promotions: [], // à compléter si l’API renvoie des promotions
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

        setData(transformed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Affichage en cours
  if (loading) {
    return (
      <div className="p-4">
        <p>Chargement...</p>
      </div>
    );
  }

  // Erreur survenue
  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">Erreur: {error}</p>
      </div>
    );
  }

  // Affichage du tableau
  return (
    <div className="p-4">
      <Table columns={columns} data={data} />
    </div>
  );
};

export default UsersPage;