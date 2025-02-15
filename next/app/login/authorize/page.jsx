// app/login/authorize/page.jsx
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { linkGithubAccount } from '@/app/services/routes';

import gittownhublogo from '../../../public/assets/pictures/gittownhub.svg';
import miageLogo from '../../../public/assets/pictures/miage.png';
import LinkOrgForm from '../../components/layout/LinkOrgForm';

export default function AuthorizePage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  console.log('code', code);

  const [githubLinked, setGithubLinked] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Récupère la valeur d’un cookie donné.
   * @param {string} name - Le nom du cookie.
   * @returns {string|null} - La valeur du cookie ou null s'il n'existe pas.
   */
  const getCookie = (name) => {
    const cookieValue = `; ${document.cookie}`;
    const parts = cookieValue.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  useEffect(() => {
    const userId = getCookie('userId');
    const token = getCookie('token');

    if (code && userId && token) {
      const linkAccount = async () => {
        try {
          const response = await linkGithubAccount(userId, code, token);
          console.log('Réponse de la liaison GitHub:', response);
          setGithubLinked(true);
        } catch (err) {
          console.error(err);
          setError(err.message);
        }
      };

      linkAccount();
    } else if (!userId || !token) {
      setError("Informations de connexion manquantes. Veuillez vous reconnecter.");
    }
  }, [code]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Logo en haut SEULEMENT sur mobile */}
      <div className="md:hidden flex justify-center pt-2">
        <Image
          src={gittownhublogo}
          alt="GitTownHub logo"
          width={300}
          height={200}
        />
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center max-w-screen-2xl mx-auto w-full px-4">
        <div className="hidden md:flex flex-1 items-center justify-center">
          <Image
            src={gittownhublogo}
            alt="GitTownHub logo"
            width={400}
            height={400}
          />
        </div>

        {/* Formulaire qui prend toute la largeur sur mobile */}
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="w-full sm:max-w-md">
            {error && (
              <div className="mb-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            {githubLinked ? (
              <LinkOrgForm />
            ) : (
              <div className="text-center">
                <p>En cours de liaison avec GitHub...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logo Miage en bas */}
      <div className="flex justify-center pb-2">
        <Image
          src={miageLogo}
          alt="Miage logo"
          width={300}
          height={300}
        />
      </div>
    </div>
  );
}
