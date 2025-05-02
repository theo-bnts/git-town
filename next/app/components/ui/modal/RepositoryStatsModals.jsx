'use client';

import React, { useState } from 'react';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { XIcon, InfoIcon } from '@primer/octicons-react';
import { textStyles } from '@/app/styles/tailwindStyles';
import Graph from '@/app/components/ui/Graph';
import Table from '@/app/components/layout/table/Table';

function InfoTooltip({ show }) {
  if (!show) return null;
  return (
    <div className="absolute top-8 left-0 z-50 w-80">
      <Card variant="success">
        <p className={textStyles.defaultWhite}>
          Ces données peuvent venir du cache pour que votre expérience ne soit pas ralentie. Les données peuvent présenter un retard jusqu’à une heure.
        </p>
      </Card>
    </div>
  );
}

export default function RepositoryStatsModal({ isOpen, onClose, stats, loading }) {
  const [showInfo, setShowInfo] = useState(false);

  if (!isOpen) return null;

  // Préparation des données pour le graphique
  let weeklyData = [];
  if (stats?.Global?.Commits?.Weekly) {
    const { Counts, FirstDayOfFirstWeek } = stats.Global.Commits.Weekly;
    const firstDate = new Date(FirstDayOfFirstWeek);
    weeklyData = Counts.map((count, i) => ({
      semaine: new Date(firstDate.getTime() + i * 7 * 24 * 60 * 60 * 1000)
        .toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' }),
      commits: count,
    }));
  }

  // Préparation des colonnes pour la table
  const columns = [
    { key: 'name', title: 'Étudiant(s)', sortable: true },
    { key: 'merges', title: 'Merges', sortable: true },
    { key: 'prs', title: 'PR', sortable: true },
    { key: 'commits', title: 'Commits', sortable: true },
    { key: 'additions', title: '++', sortable: true },
    { key: 'deletions', title: '--', sortable: true },
  ];

  // Préparation des données pour la table
  let data = [];
  if (stats?.Users?.length) {
    data = stats.Users.map(userStat => {
      const user = userStat.User || {};
      const lines = userStat.Lines?.Weekly?.Counts || [];
      const additions = lines.reduce((sum, l) => sum + (l.Additions || 0), 0);
      const deletions = lines.reduce((sum, l) => sum + (l.Deletions || 0), 0);

      return {
        name: user.FullName || '',
        merges: userStat.PullRequests?.Closed ?? 0,
        prs: (userStat.PullRequests?.Open ?? 0) + (userStat.PullRequests?.Closed ?? 0),
        commits: userStat.Commits?.Weekly?.Counts?.reduce((sum, c) => sum + c, 0) ?? 0,
        additions,
        deletions,
      };
    });

    // Ajout d'une ligne "Équipe complète"
    if (data.length > 0) {
      data.push({
        name: <span className="font-bold">Équipe complète</span>,
        merges: data.reduce((sum, d) => sum + (d.merges || 0), 0),
        prs: data.reduce((sum, d) => sum + (d.prs || 0), 0),
        commits: data.reduce((sum, d) => sum + (d.commits || 0), 0),
        additions: data.reduce((sum, d) => sum + (d.additions || 0), 0),
        deletions: data.reduce((sum, d) => sum + (d.deletions || 0), 0),
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-[var(--popup-color)] flex items-start justify-center z-50 overflow-y-auto py-4 px-2">
      <div className="w-full max-w-5xl my-auto">
        <Card variant="default" className="relative p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <header className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10 py-2">
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
                <InfoTooltip show={showInfo} />
              </div>
            </div>
            <Button variant="action_icon_warn" onClick={onClose}>
              <XIcon size={24} />
            </Button>
          </header>

          {/* Affiche toujours le loader si loading */}
          {loading && (
            <div className="flex justify-center items-center h-40">
              <span className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--accent-color)]"></span>
              <span className="ml-4">Chargement des statistiques...</span>
            </div>
          )}

          {/* Affiche les stats même si loading est true */}
          {stats && (
            <div className="space-y-6">
              {/* Langages */}
              <div>
                <p className={textStyles.bold}>Langage(s) de programmation</p>
                <ul className="flex flex-wrap gap-4 mt-2">
                  {stats.Global.Languages?.map(lang => (
                    <li key={lang.Name} className="flex items-center gap-2">
                      <span className={textStyles.default}>{lang.Name}</span>
                      <span className="text-sm text-gray-500">{lang.Percentage}%</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Graphique commits/semaine */}
              <div className="overflow-x-auto">
                <div className="min-w-[500px]">
                  <Graph
                    title="Nombre de commits par semaine"
                    data={weeklyData}
                    xAxisKey="semaine"
                    series={[
                      {
                        dataKey: 'commits',
                        color: 'var(--accent-color)',
                        name: 'Commits',
                      },
                    ]}
                    type="area"
                    height={260}
                    showLegend={false}
                    showTypeSelector={true}
                    className=""
                    emptyMessage={loading ? "Chargement des données..." : "Aucune donnée à afficher"}
                  />
                </div>
              </div>

              {/* Table des contributions */}
              <div className="mt-8">
                <p className={textStyles.bold}>Détail des contributions</p>
                <Table 
                  columns={columns} 
                  data={data}
                  toolbarContents={null}
                />
              </div>
            </div>
          )}

          {/* Si pas de stats du tout */}
          {!stats && !loading && (
            <div className="text-center text-gray-500">Aucune donnée à afficher.</div>
          )}
        </Card>
      </div>
    </div>
  );
}