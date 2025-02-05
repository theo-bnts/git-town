// app/login/page.jsx
"use client";
import Image from "next/image";
import LoginForm from "../components/layout/LoginForm";
import gittownlogo from "../../public/assets/pictures/gittown.svg";
import miageLogo from "../../public/assets/pictures/miage.png";

export default function LoginPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 justify-between p-16">
        {/* Colonne gauche */}
        <div className="flex flex-col items-center justify-center flex-1">
          <Image src={gittownlogo} alt="Gittown logo" width={300} height={300} />
        </div>
        {/* Colonne droite */}
        <div className="flex flex-col items-center justify-center flex-1">
          <LoginForm />
        </div>
      </div>
      {/* Pied de page */}
      <div className="flex justify-center pb-8">
        <Image src={miageLogo} alt="Miage logo" width={200} height={200} />
      </div>
    </div>
  );
}