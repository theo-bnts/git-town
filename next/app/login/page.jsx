// app/login/page.jsx
"use client";
import { useState } from "react";
import Image from "next/image";

import LoginForm from "../components/layout/LoginForm";
import gittownlogo from "../../public/assets/pictures/gittown.svg";
import miageLogo from "../../public/assets/pictures/miage.png";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Image src={gittownlogo} alt="Gittown logo" width={200} height={200} />
      <Image src={miageLogo} alt="Miage logo" width={200} height={200} />
      <LoginForm />
    </div>
  );
}
