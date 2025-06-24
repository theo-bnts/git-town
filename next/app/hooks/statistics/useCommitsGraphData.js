import { useMemo } from 'react';
import { calculateDelta } from '@/app/utils/deltaUtils';

/**
 * Prépare les données pour le graphique de commits et delta
 */
export function useCommitsGraphData(commits, lines) {
  return useMemo(() => {
    if (!commits?.Weekly?.Counts) return [];

    const firstDay = commits.Weekly.FirstDayOfFirstWeek 
      ? new Date(commits.Weekly.FirstDayOfFirstWeek) 
      : new Date();
    
    const counts = commits.Weekly.Counts || [];
    const hasLines = lines?.Weekly?.Counts && Array.isArray(lines.Weekly.Counts);
    const linesCounts = hasLines ? lines.Weekly.Counts : [];

    return counts.map((count, idx) => {
      const week = new Date(firstDay);
      week.setDate(week.getDate() + idx * 7);
      const formattedDate = week.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
      
      let delta = 0;
      if (idx < linesCounts.length) {
        const weekData = linesCounts[idx];
        if (weekData) {
          const additions = weekData.Additions || 0;
          const deletions = weekData.Deletions || 0;
          delta = calculateDelta(additions, deletions);
        }
      }

      return {
        week: formattedDate,
        commits: count || 0,
        delta
      };
    });
  }, [commits, lines]);
}
