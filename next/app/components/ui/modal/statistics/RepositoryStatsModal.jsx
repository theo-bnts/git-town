'use client';

import React, { useState } from 'react';

import { XIcon, InfoIcon } from '@primer/octicons-react';

import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import InfoTooltip from '@/app/components/ui/modal/statistics/InfoTooltip';
import LanguagesSection from '@/app/components/ui/modal/statistics/LanguagesSection';
import CommitsGraph from '@/app/components/ui/modal/statistics/CommitsGraph';
import ContributionsTable from '@/app/components/ui/modal/statistics/ContributionsTable';

const cacheInfoText = "Ces données peuvent venir du cache pour que votre expérience ne soit pas ralentie. Les données peuvent présenter un retard jusqu'à une heure.";

/**
 * Modal affichant les statistiques d'un dépôt GitHub
 * 
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.isOpen - Si la modale est ouverte
 * @param {Function} props.onClose - Fonction appelée pour fermer la modale
 * @param {Object|null} props.stats - Les statistiques à afficher
 * @param {boolean} props.loading - Si le chargement est en cours
 */
export default function RepositoryStatsModal({ isOpen, onClose, stats, loading }) {
  const [showInfo, setShowInfo] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="
      fixed inset-0 bg-[var(--popup-color)] 
      flex items-start justify-center 
      z-50 overflow-y-auto py-4 px-2"
    >
      <div className="w-full max-w-5xl my-auto">
        <Card variant="default" className="
          relative p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
        >
          <header className="
            flex items-center justify-between 
            mb-4 sticky top-0 bg-white z-10 py-2"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold leading-none">Statistiques</h3>
              <div className="relative flex items-center">
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
                <InfoTooltip show={showInfo} text={cacheInfoText} />
              </div>
            </div>
            <Button variant="action_icon_warn" onClick={onClose}>
              <XIcon size={24} />
            </Button>
          </header>

          {loading && (
            <div className="flex justify-center items-center h-40">
              <span className="
                animate-spin rounded-full h-10 w-10 
                border-b-2 border-[var(--accent-color)]">
              </span>
              <span className="ml-4">
                Chargement des statistiques...
              </span>
            </div>
          )}

          {!loading && stats && (
            <div className="space-y-6">
              <LanguagesSection languages={stats.Global?.Languages} />
              <CommitsGraph commits={stats.Global?.Commits} loading={false} />
              <ContributionsTable users={stats.Users} />
            </div>
          )}

          {!loading && !stats && (
            <div className="text-center text-gray-500">
              Aucune donnée à afficher.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
