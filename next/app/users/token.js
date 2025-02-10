export async function getToken(body = {}) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      throw new Error(`Erreur lors de la récupération du token: ${res.statusText}`);
    }
    
    return res.json();
  }