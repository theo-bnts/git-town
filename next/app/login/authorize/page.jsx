// app/login/authorize/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { useSearchParams } from 'next/navigation';

import postOAuthCode from '@/app/services/users/id/github/postOAuthCode';

import gittownhublogo from '../../../public/assets/pictures/gittownhub.svg';
import miageLogo from '../../../public/assets/pictures/miage.png';
import LinkOrgForm from '../../components/layout/LinkOrgForm';

export default function AuthorizePage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const [githubLinked, setGithubLinked] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = Cookies.get('userId');
    const token = Cookies.get('token');

    if (code && userId && token) {
      const linkAccount = async () => {
        try {
          const response = await postOAuthCode(userId, code, token);
          setGithubLinked(true);
        } catch (err) {
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
          {error && <Text variant="warn">{error}</Text>}
            {!githubLinked ? (
              <LinkOrgForm />
            ) : (
              <div className="text-center">
                <p>En cours de liaison avec GitHub...</p>
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
