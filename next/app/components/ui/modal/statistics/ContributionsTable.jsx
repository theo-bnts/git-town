'use client';

import React, { useMemo } from 'react';
import { textStyles } from '@/app/styles/tailwindStyles';
import Table from '@/app/components/layout/table/Table';
import Tag from '@/app/components/ui/Tag';

const getTableColumns = () => [
  { key: 'name', title: 'Étudiant(s)', sortable: true },
  { key: 'merges', title: 'Merges', sortable: true },
  { key: 'prs', title: 'PR', sortable: true },
  { key: 'commits', title: 'Commits', sortable: true },
  { key: 'additions', title: '++', sortable: true },
  { key: 'deletions', title: '--', sortable: true },
  { 
    key: 'delta', 
    title: 'Δ', 
    sortable: true,
    render: (value) => {
      const numValue = parseFloat(value);
      const formattedValue = isNaN(numValue) ? '0.0' : numValue.toFixed(1);
      
      return (
        <Tag 
          variant={
            numValue > 0 ? "success" : 
            numValue < 0 ? "danger" : 
            "default"
          }
        >
          Δ {formattedValue}
        </Tag>
      );
    }
  },
];

/**
 * Affiche un tableau des contributions par utilisateur
 */
export default function ContributionsTable({ userStats = [], teamStats }) {
  const { columns, tableData } = useMemo(() => {
    const columns = getTableColumns();
    
    const userData = userStats.map(({ user, stats }) => ({
      name: user?.FullName || '',
      merges: stats.merges,
      prs: stats.pullRequests,
      commits: stats.totalCommits,
      additions: stats.addedLines,
      deletions: stats.deletedLines,
      delta: parseFloat(stats.delta.toFixed(1)),
    }));

    let data = [...userData];
    
    if (data.length > 0 && teamStats) {
      data.push({
        name: <span className="font-bold">Équipe complète</span>,
        merges: teamStats.merges,
        prs: teamStats.pullRequests,
        commits: teamStats.totalCommits,
        additions: teamStats.addedLines,
        deletions: teamStats.deletedLines,
        delta: parseFloat(teamStats.delta.toFixed(1)),
      });
    }
    
    return { columns, tableData: data };
  }, [userStats, teamStats]);

  if (!tableData.length) return null;

  return (
    <div className="mt-8">
      <p className={textStyles.bold}>Détail des contributions</p>
      <Table 
        columns={columns} 
        data={tableData}
        toolbarContents={null}
        showFilters={false}
      />
    </div>
  );
}
