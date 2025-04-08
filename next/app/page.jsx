// app/page.jsx

import React from 'react';
import { cookies } from 'next/headers';
import getUser from '@/app/services/api/users/id/getUser';
import PanelManager from '@/app/components/layout/PanelManager';

async function getCookieValue(key) {
  const cookieStore = await cookies();
  return cookieStore.get(key)?.value;
}

export default async function HomePage() {
  const token = await getCookieValue("token");
  const userId = await getCookieValue("userId");

  let fullName = null;
  if (token && userId) {
    try {
      const userData = await getUser(userId, token);
      fullName = userData.FullName;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur", error);
    }
  }

  return <PanelManager fullName={fullName} />;
}
