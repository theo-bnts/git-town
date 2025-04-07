'use client';

import React, { useState, useEffect } from 'react';
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

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-[2000] mx-auto">
      <header className="pt-4 px-4">
        <Header 
          fullName={fullName} 
          navItems={navItems} 
          activePanel={activePanel} 
          setActivePanel={setActivePanel}
          isMobile={isMobile}
        />
      </header>

      <div className="flex flex-1 pt-4 px-4 overflow-hidden">
        {!isMobile && (
          <div className="w-[125px] pr-2">
            <Sidebar
              items={navItems}
              activePanel={activePanel}
              onSelect={setActivePanel}
              className="h-full"
            />
          </div>
        )}

        <main className="flex-1 overflow-hidden flex flex-col">
          {ActivePanelComponent && <ActivePanelComponent />}
        </main>

      </div>
    </div>
  );
}
