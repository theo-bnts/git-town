'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

import postOAuthCode from '@/app/services/api/users/id/github/postOAuthCode';
import { getCookie } from '@/app/services/cookies';

import gittownhublogo from '../../../public/assets/pictures/git-townhub.svg';
import miageLogo from '../../../public/assets/pictures/miage.svg';
import LinkOrgForm from '@/app/components/layout/forms/github/LinkOrgForm';

import { useNotification } from '@/app/context/NotificationContext';

export default function AuthorizePageContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const router = useRouter();

  const [githubLinked, setGithubLinked] = useState(!code);
  const [error, setError] = useState(null);

  const notify = useNotification();

  useEffect(() => {
    async function linkAccount() {
      const userId = await getCookie('userId');
      const token = await getCookie('token');

      if (code && userId && token) {
        try {
          await postOAuthCode(userId, code, token);
          notify('Compte GitHub lié !', 'success');
          setGithubLinked(true);
        } catch (err) {
          notify('Erreur lors de la liaison avec GitHub. Veuillez réessayer.', 'error');
          router.replace('/login/link');
        }
      } else if (!userId || !token) {
        notify("Informations de connexion manquantes. Veuillez vous reconnecter.", 'error');
        setError("Connexion invalide");
      }
    }
    linkAccount();
  }, [code, router, notify]);

  useEffect(() => {
    if (error) {
      router.replace('/login/link');
    }
  }, [error, router]);

  return (
    <div className="flex flex-col min-h-screen">
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

        <div className="flex-1 flex items-center justify-center w-full">
          <div className="w-full sm:max-w-md">
            {githubLinked ? (
              <LinkOrgForm router={router} />
            ) : (
              <div className="text-center">
                <p>En cours de liaison avec GitHub…</p>
              </div>
            )}
          </div>
        </div>
      </div>

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
