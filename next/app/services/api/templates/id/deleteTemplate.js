'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { templateRoute } from '@/app/services/routes';

/**
 * DELETE /templates/:id
 *
 * @param {string} templateId
 * @param {string} token
 */
export default async function deleteTemplate(templateId, token) {
  const url = templateRoute(templateId);

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) return Promise.reject(handleApiError(res, data));
  return data;
}
