'use client';

import React, { useState, useMemo } from 'react';
import { XIcon, InfoIcon } from '@primer/octicons-react';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import { 
  InfoTooltip, 
  LanguagesSection,
  ContributionsTable,
  ContributionCard
} from '@/app/components/ui/modal/statistics';
import { useRepositoryStats } from '@/app/hooks/useRepositoryStats';

const cacheInfoText = "Ces données peuvent venir du cache pour que votre expérience ne soit pas ralentie. Les données peuvent présenter un retard jusqu'à une heure.";

/**
 * Carte principale affichant les statistiques globales du dépôt
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.stats - Données statistiques
 * @param {Function} props.onClose - Fonction appelée pour fermer la modal
 * @param {boolean} props.isPartial - Indique si les données sont partielles
 */
export default function StatsCard({ stats, onClose, isPartial }) {
  const [showInfo, setShowInfo] = useState(false);
  const { calculateUserTotals } = useRepositoryStats(stats);
  
  const hasGlobalData = stats?.Global && 
                        stats?.Global.Commits && 
                        stats?.Global.Lines;
  
  const globalStats = useMemo(() => {
    if (hasGlobalData) return stats.Global;
    
    if (stats?.Users?.length > 0) {
      const userWithDates = stats.Users.find(user => 
        user?.Commits?.Weekly?.FirstDayOfFirstWeek && 
        user?.Lines?.Weekly?.FirstDayOfFirstWeek
      );
      
      const aggregatedStats = {
        Commits: {
          Weekly: {
            Counts: [],
            FirstDayOfFirstWeek: userWithDates?.Commits?.Weekly?.FirstDayOfFirstWeek || new Date().toISOString(),
            FirstDayOfLastWeek: userWithDates?.Commits?.Weekly?.FirstDayOfLastWeek
          }
        },
        Lines: {
          Weekly: {
            Counts: [],
            FirstDayOfFirstWeek: userWithDates?.Lines?.Weekly?.FirstDayOfFirstWeek || new Date().toISOString()
          }
        }
      };
      
      const firstUser = stats.Users[0];
      const weeksCount = firstUser?.Commits?.Weekly?.Counts?.length || 0;
      
      for (let i = 0; i < weeksCount; i++) {
        aggregatedStats.Commits.Weekly.Counts[i] = 0;
        aggregatedStats.Lines.Weekly.Counts[i] = { Additions: 0, Deletions: 0 };
      }
      
      stats.Users.forEach(user => {
        if (user?.Commits?.Weekly?.Counts) {
          user.Commits.Weekly.Counts.forEach((count, index) => {
            if (index < weeksCount) {
              aggregatedStats.Commits.Weekly.Counts[index] += count || 0;
            }
          });
        }
        
        if (user?.Lines?.Weekly?.Counts) {
          user.Lines.Weekly.Counts.forEach((line, index) => {
            if (index < weeksCount) {
              aggregatedStats.Lines.Weekly.Counts[index].Additions += line?.Additions || 0;
              aggregatedStats.Lines.Weekly.Counts[index].Deletions += line?.Deletions || 0;
            }
          });
        }
      });
      
      return aggregatedStats;
    }
    
    return null;
  }, [stats, hasGlobalData]);
  
  const shouldShowGlobalStats = globalStats || (stats?.Users?.length > 0);
  
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
          {shouldShowGlobalStats ? (
            <ContributionCard
              contributor={globalStats || {}} 
              isTeam={true}
              calculateUserTotals={calculateUserTotals}
              stats={stats}
            />
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
              Chargement des statistiques d'équipe...
            </div>
          )}
        </div>
        
        <div className="w-full overflow-x-hidden">
          <ContributionsTable users={stats.Users} />
        </div>
      </div>
    </Card>
  );
}
