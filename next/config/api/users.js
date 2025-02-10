import { USERS_ROUTE } from "@/config/api/routes";

export async function getUsers(token) {
    const res = await fetch(USERS_ROUTE, {
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });
    
    if (!res.ok) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${res.statusText}`);
    }
    
    return res.json();
  }