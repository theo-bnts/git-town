'use client';

import React, { useMemo } from 'react';
import { textStyles } from '@/app/styles/tailwindStyles';
import Table from '@/app/components/layout/table/Table';
import { calculateDelta } from '@/app/utils/calculateDelta';
import { calculateTotal, extractLineStatistics } from '@/app/utils/statisticsUtils';
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
export default function ContributionsTable({ users = [], stats }) {
  const { columns, tableData } = useMemo(() => {
    const columns = getTableColumns();
    
    const userData = users.map(userStat => {
      const user = userStat.User || {};
      const { addedLines: additions, deletedLines: deletions } = extractLineStatistics(userStat);
      const delta = calculateDelta(additions, deletions);

      return {
        name: user.FullName || '',
        merges: userStat.PullRequests?.Closed ?? 0,
        prs: (userStat.PullRequests?.Open ?? 0) + (userStat.PullRequests?.Closed ?? 0),
        commits: userStat.Commits?.Weekly?.Counts?.reduce((sum, c) => sum + (c || 0), 0) ?? 0,
        additions,
        deletions,
        delta: parseFloat(delta.toFixed(1)),
      };
    });

    let data = [...userData];
    
    if (data.length > 0) {
      const globalCommits = stats?.Global?.Commits?.Weekly?.Counts?.reduce(
        (sum, count) => sum + (Number.isFinite(count) ? count : 0), 0
      ) || calculateTotal(data, 'commits');
      
      const totalAdditions = calculateTotal(data, 'additions');
      const totalDeletions = calculateTotal(data, 'deletions');
      const totalDelta = calculateDelta(totalAdditions, totalDeletions);
      
      data.push({
        name: <span className="font-bold">Équipe complète</span>,
        merges: calculateTotal(data, 'merges'),
        prs: calculateTotal(data, 'prs'),
        commits: globalCommits,
        additions: totalAdditions,
        deletions: totalDeletions,
        delta: parseFloat(totalDelta.toFixed(1)),
      });
    }
    
    return { columns, tableData: data };
  }, [users, stats]);

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
