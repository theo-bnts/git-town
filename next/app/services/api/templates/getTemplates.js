'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { templatesRoute } from '@/app/services/routes';

/**
 * GET /templates
 * @param {string} token
 * @returns {Promise<object[]>}
 */
export default async function getTemplates(token) {
  const url = templatesRoute();
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : [];

  if (!res.ok) return Promise.reject(handleApiError(res, data));
  return data;
}
