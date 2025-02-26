// app/login/authorize/AuthorizePageContent.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

import postOAuthCode from '@/app/services/api/users/id/github/postOAuthCode';

import { getCookie } from '@/app/services/cookies';

import gittownhublogo from '../../../public/assets/pictures/gittownhub.svg';
import miageLogo from '../../../public/assets/pictures/miage.png';
import LinkOrgForm from '@/app/components/layout/forms/github/LinkOrgForm';

export default function AuthorizePageContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const router = useRouter();

  const [githubLinked, setGithubLinked] = useState(!code);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = getCookie('userId');
    const token = getCookie('token');

    if (code && userId && token) {
      const linkAccount = async () => {
        try {
          await postOAuthCode(userId, code, token);
          setGithubLinked(true);
        } catch (err) {
            router.replace('/login/link');
        }
      };

      linkAccount();
    } else if (!userId || !token) {
      setError("Informations de connexion manquantes. Veuillez vous reconnecter.");
    }
  }, [code]);

  useEffect(() => {
    if (error) {
      router.replace("/login/link");
    }
  }, [error]);

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
