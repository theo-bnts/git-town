'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { repositoryArchiveRoute } from '@/app/services/routes';

/**
 * Archive ou désarchive un dépôt
 * POST /repositories/:repositoryId/archive
 *
 * @param {string} repositoryId – l’ID du dépôt.
 * @param {boolean} archived – true pour archiver, false pour désarchiver.
 * @returns {Promise<object>}
 */
export default async function archiveRepository(repositoryId, archived, token) {
  const url = repositoryArchiveRoute(repositoryId);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ Archived: archived }),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    return Promise.reject(handleApiError(res, data));
  }
  return data;
}
