'use client';
// app/login/link/page.jsx
import Image from 'next/image';

import gittownhublogo from '../../../public/assets/pictures/gittownhub.svg';
import LinkForm from '../../components/layout/LinkForm';
import miageLogo from '../../../public/assets/pictures/miage.png';

export default function LinkPage() {
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
            <LinkForm />
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
