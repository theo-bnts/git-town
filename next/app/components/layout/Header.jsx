// app/components/layout/Header.jsx
'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { SignOutIcon } from "@primer/octicons-react";
import { useRouter } from "next/navigation";

import delToken from "@/app/services/api/users/id/token/delToken";
import { getCookie, removeCookie } from "@/app/services/cookies";

import gittownlogo from "../../../public/assets/pictures/gittown.svg";
import { textStyles } from "@/app/styles/tailwindStyles";

import Card from "@/app/components/ui/Card";

const getInitials = (name) => {
  if (!name) return "";
  return name.split(" ").map((word) => word[0]);
};

export default function Header({ fullName }) {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const displayName = isMobile ? getInitials(fullName) : fullName || "Utilisateur";

  const handleSignOut = async () => {
    try {
      const token = await getCookie("token");
      const userId = await getCookie("userId");

      if (token && userId) {
        await delToken(userId, token);
      }

      await removeCookie("token");
      await removeCookie("userId");

      router.replace("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  return (
    <header className="p-4">
      <div className="max-w-screen-2xl mx-auto">
        <Card variant="default">
          <div className="flex items-center justify-between">
            <div>
              <Image src={gittownlogo} alt="GitTown" className="w-48" />
            </div>
            <div className="flex items-center space-x-4">
              <p className={`${textStyles.bold} text-xl`}>{displayName}</p>
              <span 
                className="
                  cursor-pointer text-[var(--warn-color)] 
                  hover:text-[var(--warn-color-hover)]"
                onClick={handleSignOut}
              >
                <SignOutIcon size={24} />
              </span>
            </div>
          </div>
        </Card>
      </div>
    </header>
  );
}
