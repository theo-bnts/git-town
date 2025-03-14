// app/page.jsx

import React from 'react';
import { cookies } from 'next/headers';

import getUser from '@/app/services/api/users/id/getUser';
import UsersPanel from '@/app/components/layout/models/UsersPanel';
import Header from '@/app/components/layout/Header';
import ImportUserModal from '@/app/components/layout/forms/modal/ImportUserModal';

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

  return (
    <div className="flex flex-col min-h-screen">
      <Header fullName={fullName} />
      <UsersPanel />
      <ImportUserModal />
    </div>
  );
}
