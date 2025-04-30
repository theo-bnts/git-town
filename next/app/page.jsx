// app/page.jsx

import React from "react";
import { cookies } from "next/headers";
import PanelManager from "@/app/components/layout/PanelManager";
import { decodeUserInfo } from "@/app/services/auth";

export default async function HomePage() {
  const cookieStore = await cookies();
  const rawUserInfo = cookieStore.get("userInfo")?.value;

  const decodedInfo = decodeUserInfo(rawUserInfo) ?? {};
  const { fullName = null, role = null } = decodedInfo;

  return <PanelManager fullName={fullName} role={role} />;
}
