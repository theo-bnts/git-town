'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SignOutIcon, ThreeBarsIcon } from '@primer/octicons-react';
import { useRouter } from 'next/navigation';

import delToken from '@/app/services/api/users/id/token/delToken';
import { getCookie, removeCookie } from '@/app/services/cookies';

import gittownlogo from '../../../public/assets/pictures/git-town.svg';
import { textStyles } from '@/app/styles/tailwindStyles';

import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { useNotification } from '@/app/context/NotificationContext';

const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map((word) => word[0]).join('');
};

export default function Header({
  fullName,
  navItems = [],
  activePanel,
  setActivePanel,
  isMobile = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const notify = useNotification();

  const displayName = isMobile
    ? getInitials(fullName)
    : fullName || 'Utilisateur';

  const handleSignOut = async () => {
    try {
      const token = await getCookie('token');
      const userId = await getCookie('userId');
      const tokenId = await getCookie('tokenId');

      if (token && userId && tokenId) {
        await delToken(userId, token, tokenId);
      }

      await Promise.all([
        removeCookie('token'),
        removeCookie('userId'),
        removeCookie('tokenId'),
        removeCookie('userInfo'),
      ]);

      notify('Déconnexion réussie', 'success');
      router.replace('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
      notify('Erreur lors de la déconnexion', 'error');
    }
  };

  return (
    <Card variant="default">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isMobile && (
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="mr-2"
              >
                <ThreeBarsIcon size={24} />
              </button>
            )}
            <Image src={gittownlogo} alt="GitTown" className="w-40" />
          </div>

          <div className="flex items-center space-x-4">
            <p className={`${textStyles.bold} text-xl`}>{displayName}</p>
            <Button variant="action_icon_warn" onClick={handleSignOut}>
              <SignOutIcon size={24} />
            </Button>
          </div>
        </div>

        {isMobile && menuOpen && (
          <ul className="flex flex-col space-y-4 mt-4">
            {navItems.map((item, index) => {
              const isActive = activePanel === item.label;
              return (
                <li key={index}>
                  <button
                    className={`text-left w-full text-xl ${
                      isActive ? textStyles.selected : textStyles.default
                    }`}
                    onClick={() => {
                      setActivePanel(item.label);
                      setMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
