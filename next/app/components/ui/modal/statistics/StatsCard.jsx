'use client';

import React, { useState } from 'react';

import { XIcon, InfoIcon } from '@primer/octicons-react';

import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import { 
  InfoTooltip, 
  LanguagesSection, 
  CommitsGraph, 
  ContributionsTable 
} from '@/app/components/ui/modal/statistics';

const cacheInfoText = "Ces données peuvent venir du cache pour que votre expérience ne soit pas ralentie. Les données peuvent présenter un retard jusqu'à une heure.";

/**
 * Carte principale affichant les statistiques globales du dépôt
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.stats - Données statistiques
 * @param {Function} props.onClose - Fonction appelée pour fermer la modal
 */
export default function StatsCard({ stats, onClose }) {
  const [showInfo, setShowInfo] = useState(false);
  
  return (
    <Card variant="default" className="p-3 lg:p-4 w-full h-full">
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold leading-none">Statistiques</h3>
            <div className="relative">
              <Button
                variant="action_icon"
                type="button"
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
                onFocus={() => setShowInfo(true)}
                onBlur={() => setShowInfo(false)}
                tabIndex={0}
                className="align-middle"
              >
                <InfoIcon size={16} />
              </Button>
              <InfoTooltip 
                show={showInfo} 
                text={cacheInfoText} 
                position="top-9 left-0" 
                variant="success" 
              />
            </div>
          </div>
          <Button variant="action_icon_warn" onClick={onClose}>
            <XIcon size={24} />
          </Button>
        </div>

        <LanguagesSection languages={stats.Global?.Languages} />
        
        <div className="w-full overflow-x-hidden">
          <CommitsGraph 
            commits={stats.Global?.Commits} 
            loading={false}
            title="Commits de l'équipe par semaine"
            height={220}
          />
        </div>
        
        <div className="w-full overflow-x-hidden">
          <ContributionsTable users={stats.Users} />
        </div>
      </div>
    </Card>
  );
}
