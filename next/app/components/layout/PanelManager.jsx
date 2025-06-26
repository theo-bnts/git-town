'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/app/components/layout/Header';
import Sidebar from '@/app/components/layout/Sidebar';
import UsersPanel from '@/app/components/layout/panel/UsersPanel';
import PromotionPanel from '@/app/components/layout/panel/PromotionsPanel';
import EnseignementUnitPanel from '@/app/components/layout/panel/EnseignementUnitPanel';
import TemplatePanel from '@/app/components/layout/panel/TemplatePanel';
import RepositoriesPanel from '@/app/components/layout/panel/RepositoriesPanel';

export default function PanelManager({ fullName, role, userId }) {
  const navbarItems = [
    { label: 'Dépots', component: RepositoriesPanel },
    { label: 'Utilisateurs', component: UsersPanel },
    { label: 'Promotions', component: PromotionPanel },
    { label: 'Modèles', component: TemplatePanel },
    { label: 'UE', component: EnseignementUnitPanel },
  ];

  const allowedByRole = {
    administrator: navbarItems.map(item => item.label),
    teacher: ['Utilisateurs', 'Dépots'],
    student: ['Dépots'],
  };

  const navItems = navbarItems.filter(item =>
    allowedByRole[role]?.includes(item.label)
  );

  const [activePanel, setActivePanel] = useState(
    navItems[0]?.label ?? null
  );

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ActivePanelComponent = navItems.find(
    item => item.label === activePanel
  )?.component;

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

        <main className="flex-1 overflow-hidden flex flex-col pt-2 pl-2">
          {ActivePanelComponent && (
            <ActivePanelComponent
              role={role}
              userId={userId}
            />
          )}
        </main>
      </div>
    </div>
  );
}
