import { TOKEN_ROUTE } from "@/config/api/routes";

export async function getToken(body = {}) {
  const res = await fetch(TOKEN_ROUTE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    throw new Error(`Erreur lors de la récupération du token: ${res.statusText}`);
  }
  
  return res.json();
}