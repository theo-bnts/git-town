// token.js

import { publicUserRoute, tokenRoute } from "@/config/api/routes";

/**
 * Récupère l'ID d'un utilisateur à partir de son email
 */
export async function getUserIdByEmail(email) {
  const url = publicUserRoute(email);
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Erreur lors de la récupération de l'ID user: ${res.statusText} ${email}`);
  }
  const data = await res.json(); // data: { Id, EmailAddress, ... }
  return data.Id;
}

/**
 * Récupère un token à partir de l'ID utilisateur et du mot de passe
 */
export async function getToken(userId, password) {
  const url = tokenRoute(userId);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ Password: password }),
  });

  if (!res.ok) {
    throw new Error(`Erreur lors de la récupération du token: ${res.statusText}`);
  }

  // L'API renvoie probablement { Value: <TOKEN> }
  const json = await res.json();
  return json.Value; // On renvoie directement la valeur du token
}