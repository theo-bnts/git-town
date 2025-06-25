/**
 * Utilitaire pour formatter les statistiques de dépôt
 */

import { calculateStats, generateGlobalStatsFromUsers } from './statisticsUtils';

/**
 * Formate les statistiques brutes en données structurées pour l'affichage
 * @param {Object} rawStats - Données statistiques brutes du dépôt
 * @returns {Object} Données formatées pour l'affichage
 */
export function formatStatistics(rawStats) {
  if (!rawStats) return null;
  
  // Vérifier si nous avons des données globales
  const hasGlobalData = Boolean(
    rawStats?.Global?.Commits?.Weekly?.Counts && 
    rawStats?.Global?.Lines?.Weekly?.Counts
  );
  
  // Si les données globales sont manquantes, les générer à partir des données utilisateur
  const globalStats = hasGlobalData 
    ? rawStats.Global 
    : generateGlobalStatsFromUsers(rawStats?.Users);
  
  // Calculer les statistiques de l'équipe
  const teamStats = calculateStats(globalStats, { 
    isTeam: true, 
    users: rawStats?.Users 
  });
  
  // Ajouter le nombre de membres
  if (teamStats) {
    teamStats.membersCount = Array.isArray(rawStats?.Users) ? rawStats.Users.length : 0;
  }
  
  // Préparer les statistiques par utilisateur
  const userStats = (rawStats?.Users || []).map(user => ({
    user: user.User,
    stats: calculateStats(user),
    rawData: user
  }));

  // Déterminer si des utilisateurs ont des commits
  const hasUserCommits = userStats?.some(user => user.stats.totalCommits > 0);

  // Retourner les données formatées
  return {
    globalStats,
    teamStats,
    userStats,
    hasUsers: Array.isArray(rawStats?.Users) && rawStats.Users.length > 0,
    hasGlobalData,
    hasUserCommits,
    languages: rawStats?.Global?.Languages || {}
  };
}