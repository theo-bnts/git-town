// app/components/layout/PanelManager.jsx
'use client';

import React, { useState } from 'react';
import Header from '@/app/components/layout/Header';
import Sidebar from '@/app/components/layout/Sidebar';
import UsersPanel from '@/app/components/layout/panel/UsersPanel';

export default function PanelManager({ fullName }) {
  const navItems = [
    { label: "Utilisateurs", component: UsersPanel },
    { label: "Promotions", component: () => <div>Future Promotions Panel</div> },
    { label: "Dépots", component: () => <div>Future Dépots Panel</div> },
    { label: "Modèles", component: () => <div>Future Modèles Panel</div> },
    { label: "UE", component: () => <div>Future UE Panel</div> },
  ];

  const [activePanel, setActivePanel] = useState(navItems[0].label);
  const ActivePanelComponent = navItems.find(
    (item) => item.label === activePanel
  )?.component;

  return (
    <div className="flex flex-col min-h-screen max-w-screen-2xl mx-auto">
      <header className="pt-4 px-4 flex-shrink-0">
        <Header fullName={fullName} />
      </header>
      <div className="flex flex-1 pt-4 px-4 overflow-hidden">
        <div className="w-1/6 pr-2 flex-shrink-0">
          <Sidebar
            items={navItems}
            activePanel={activePanel}
            onSelect={setActivePanel}
            className="h-full"
          />
        </div>

        <main className="w-5/6 pl-2 overflow-auto">
          {ActivePanelComponent && <ActivePanelComponent />}
        </main>

      </div>
    </div>
  );
}