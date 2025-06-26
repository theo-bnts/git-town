'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { repositoriesRoute } from '@/app/services/routes';
import getUsersRepository from './id/getUsersRepository';

/**
 * Récupère la liste des dépôts avec leurs utilisateurs associés en minimisant les appels API
 * 
 * @param {string} token - Token d'authentification
 * @returns {Promise<object[]>} - Tableau de dépôts avec leurs utilisateurs
 */
export default async function getAllRepositoriesUsers(token) {
  console.time('getAllRepositoriesUsers - total');
  console.time('getAllRepositoriesUsers - fetch repositories');
  
  // 1. Récupérer d'abord tous les dépôts
  const url = repositoriesRoute();
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  let repositories;
  try {
    repositories = await res.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des dépôts:', error);
    repositories = [];
  }
  console.timeEnd('getAllRepositoriesUsers - fetch repositories');

  if (!res.ok) {
    console.timeEnd('getAllRepositoriesUsers - total');
    return Promise.reject(handleApiError(res, repositories));
  }
  
  // Si aucun dépôt trouvé, retourner un tableau vide
  if (!repositories || repositories.length === 0) {
    console.timeEnd('getAllRepositoriesUsers - total');
    console.log('Aucun dépôt trouvé');
    return [];
  }
  
  console.log(`Nombre de dépôts récupérés: ${repositories.length}`);

  // 2. Récupérer tous les utilisateurs pour chaque dépôt en parallèle
  // mais en évitant de faire trop de requêtes simultanées
  console.time('getAllRepositoriesUsers - fetch users');
  const batchSize = 10; // Limiter le nombre de requêtes parallèles
  const enrichedRepositories = [];
  
  for (let i = 0; i < repositories.length; i += batchSize) {
    console.time(`getAllRepositoriesUsers - batch ${i / batchSize + 1}`);
    const batch = repositories.slice(i, i + batchSize);
    console.log(`Traitement du lot ${i / batchSize + 1}/${Math.ceil(repositories.length / batchSize)} (${batch.length} dépôts)`);
    
    const batchPromises = batch.map(async (repo) => {
      try {
        const users = await getUsersRepository(repo.Id, token);
        return {
          ...repo,
          studentNames: Array.isArray(users) 
            ? users.map((u) => u.FullName).sort()
            : [],
          users: users || []
        };
      } catch (error) {
        console.error(`Erreur lors de la récupération des utilisateurs pour le dépôt ${repo.Id}:`, error);
        return {
          ...repo,
          studentNames: [],
          users: []
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    enrichedRepositories.push(...batchResults);
    console.timeEnd(`getAllRepositoriesUsers - batch ${i / batchSize + 1}`);
  }
  
  console.timeEnd('getAllRepositoriesUsers - fetch users');
  console.timeEnd('getAllRepositoriesUsers - total');
  console.log(`Récupération terminée pour ${enrichedRepositories.length} dépôts avec leurs utilisateurs`);
  
  return enrichedRepositories;
}
