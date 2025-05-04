'use client';

import React, { useMemo } from 'react';
import { textStyles } from '@/app/styles/tailwindStyles';
import Table from '@/app/components/layout/table/Table';
import { calculateDelta } from '@/app/utils/calculateDelta';
import Tag from '@/app/components/ui/Tag';

/**
 * Affiche un tableau des contributions par utilisateur
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.users - Liste des utilisateurs avec leurs statistiques
 */
export default function ContributionsTable({ users = [] }) {
  const { columns, tableData } = useMemo(() => {
    const columns = [
      { key: 'name', title: 'Étudiant(s)', sortable: true },
      { key: 'merges', title: 'Merges', sortable: true },
      { key: 'prs', title: 'PR', sortable: true },
      { key: 'commits', title: 'Commits', sortable: true },
      { key: 'additions', title: '++', sortable: true },
      { key: 'deletions', title: '--', sortable: true },
      { 
        key: 'delta', 
        title: 'Delta', 
        sortable: true,
        render: (value) => {
          const numValue = parseFloat(value);
          const formattedValue = isNaN(numValue) ? '0.0' : numValue.toFixed(1);
          
          return (
            <Tag variant={numValue > 0 ? "success" : numValue < 0 ? "danger" : "default"}>
              Δ {formattedValue}
            </Tag>
          );
        }
      },
    ];
    
    const userData = users.map(userStat => {
      const user = userStat.User || {};
      const lines = userStat.Lines?.Weekly?.Counts || [];
      const additions = lines.reduce((sum, l) => sum + (l.Additions || 0), 0);
      const deletions = lines.reduce((sum, l) => sum + (l.Deletions || 0), 0);
      
      let delta = calculateDelta(additions, deletions);
      delta = parseFloat(delta.toFixed(1));

      return {
        name: user.FullName || '',
        merges: userStat.PullRequests?.Closed ?? 0,
        prs: (userStat.PullRequests?.Open ?? 0) + (userStat.PullRequests?.Closed ?? 0),
        commits: userStat.Commits?.Weekly?.Counts?.reduce((sum, c) => sum + c, 0) ?? 0,
        additions,
        deletions,
        delta,
      };
    });

    let data = [...userData];
    
    if (data.length > 0) {
      const totalAdditions = data.reduce((sum, d) => sum + (d.additions || 0), 0);
      const totalDeletions = data.reduce((sum, d) => sum + (d.deletions || 0), 0);
      
      let totalDelta = calculateDelta(totalAdditions, totalDeletions);
      totalDelta = parseFloat(totalDelta.toFixed(1));
      
      data.push({
        name: <span className="font-bold">Équipe complète</span>,
        merges: data.reduce((sum, d) => sum + (d.merges || 0), 0),
        prs: data.reduce((sum, d) => sum + (d.prs || 0), 0),
        commits: data.reduce((sum, d) => sum + (d.commits || 0), 0),
        additions: totalAdditions,
        deletions: totalDeletions,
        delta: totalDelta,
      });
    }
    
    return { columns, tableData: data };
  }, [users]);

  if (!tableData.length) return null;

  return (
    <div className="mt-8">
      <p className={textStyles.bold}>Détail des contributions</p>
      <Table 
        columns={columns} 
        data={tableData}
        toolbarContents={null}
      />
    </div>
  );
}
