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

export default function RepositoryStatsModal({ isOpen, onClose, stats, loading }) {
  const [showInfo, setShowInfo] = useState(false);

  if (!isOpen) return null;

  const hasUserCommits = stats?.Users?.some(
    user => user.Commits?.Weekly?.Counts?.some(count => count > 0)
  );

  // Fonction pour calculer le total des commits d'un utilisateur
  const calculateUserTotals = (user) => {
    if (!user || !user.Commits?.Weekly?.Counts) {
      return { totalCommits: 0, addedLines: 0, deletedLines: 0 };
    }
    
    // Calcul du total des commits
    const totalCommits = user.Commits.Weekly.Counts.reduce((sum, count) => sum + count, 0);
    
    // Calcul des lignes ajoutées/supprimées - vérification des 2 structures possibles
    let addedLines = 0;
    let deletedLines = 0;
    
    // Cas 1: Total directement disponible
    if (user.Lines?.Total) {
      addedLines = user.Lines.Total.Additions || 0;
      deletedLines = user.Lines.Total.Deletions || 0;
    } 
    // Cas 2: Calcul à partir des données hebdomadaires (comme dans ContributionsTable)
    else if (user.Lines?.Weekly?.Counts) {
      const lineCounts = user.Lines.Weekly.Counts;
      addedLines = lineCounts.reduce((sum, week) => sum + (week.Additions || 0), 0);
      deletedLines = lineCounts.reduce((sum, week) => sum + (week.Deletions || 0), 0);
    }
    
    return { totalCommits, addedLines, deletedLines };
  };

  return (
    <div className="fixed inset-0 bg-[var(--popup-color)] flex items-center justify-center z-50 overflow-hidden">
      {loading ? (
        // Conteneur dédié pour l'état de chargement - centré verticalement et horizontalement
        <div className="flex items-center justify-center w-full h-full">
          <Card variant="default" className="p-4 mx-auto max-w-md">
            <div className="flex justify-center items-center h-40">
              <span className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--accent-color)]"></span>
              <span className="ml-4">Chargement des statistiques...</span>
            </div>
          </Card>
        </div>
      ) : (
        // Conteneur pour le reste du contenu - structure inchangée
        <div className="w-full h-full overflow-y-auto py-6 lg:py-8">
          <div className="w-full max-w-[95vw] xl:max-w-[75vw] mx-auto px-2 lg:px-4">
            {!stats ? (
              <Card variant="default" className="p-4 mx-auto max-w-md">
                <div className="text-center text-gray-500">
                  Aucune donnée à afficher.
                </div>
              </Card>
            ) : (
              // Grille avec les cards - inchangée
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-6">
                {/* Card A - Statistiques - 2/3 de l'espace */}
                <div className="w-full xl:col-span-2">
                  <Card variant="default" className="p-3 lg:p-4 w-full h-full">
                    <div className="space-y-4 lg:space-y-6">
                      {/* En-tête */}
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
                </div>

                {/* Card B - Commits par utilisateur - 1/3 de l'espace */}
                <div className="w-full xl:col-span-1">
                  <Card variant="default" className="p-3 lg:p-4 w-full h-full">
                    <div className="space-y-3 lg:space-y-4">
                      <h3 className="text-lg font-bold leading-none">Contributions par utilisateur</h3>
                      
                      {!hasUserCommits ? (
                        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                          Aucune donnée de commits par utilisateur à afficher
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {stats.Users && stats.Users.map((user, index) => {
                            const { totalCommits, addedLines, deletedLines } = calculateUserTotals(user);
                            
                            return (
                              <div key={user.User?.Id || index} className="bg-gray-50 p-3 rounded-lg overflow-hidden">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-1">
                                  <p className="text-sm font-medium">
                                    {user.User?.FullName || `Utilisateur ${index + 1}`}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="px-2 py-0.5 bg-gray-200 rounded-full text-gray-700 font-mono">
                                      {totalCommits} commits
                                    </span>
                                    {addedLines > 0 && (
                                      <span className="px-2 py-0.5 bg-green-100 rounded-full text-green-700 font-mono">
                                        {addedLines} ++
                                      </span>
                                    )}
                                    {deletedLines > 0 && (
                                      <span className="px-2 py-0.5 bg-red-100 rounded-full text-red-700 font-mono">
                                        {deletedLines} --
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <CommitsGraph 
                                  commits={user.Commits} 
                                  loading={false}
                                  hideTitle={true}
                                  height={180}
                                  showLegend={true}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
