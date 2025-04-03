// app/components/layout/PannelManager.jsx
'use client';

import React, { useState } from 'react';
import Header from '@/app/components/layout/Header';
import Navbar from '@/app/components/layout/Navbar';
import UsersPanel from '@/app/components/layout/panel/UsersPanel';

export default function PannelManager({ fullName }) {
  const navItems = [
    { label: "Utilisateurs", component: UsersPanel },
    { label: "Promotions", component: () => <div>Promotions Panel</div> },
    { label: "Dépots", component: () => <div>Dépots Panel</div> },
    { label: "Modèles", component: () => <div>Modèles Panel</div> },
    { label: "UE", component: () => <div>UE Panel</div> },
  ];

  const [activePanel, setActivePanel] = useState(navItems[0].label);
  const ActivePanelComponent = navItems.find(item => item.label === activePanel)?.component;

  return (
    <div className="max-w-screen-2xl mx-auto p-4">
      <header>
        <Header fullName={fullName} />
      </header>
      <div className="flex gap-4 mt-4">
        <Navbar items={navItems} activePanel={activePanel} onSelect={setActivePanel} />
        <main className="flex-1">
          {ActivePanelComponent && <ActivePanelComponent />}
        </main>
      </div>
    </div>
  );
}
