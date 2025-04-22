'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { templateRoute, templatesRoute } from '@/app/services/routes';

/**
 * PUT  /templates              (création)
 * PATCH /templates/:id         (édition)
 *
 * @param {string|null} templateId
 * @param {object}      payload   { EnseignementUnit:{Id}, Year }
 * @param {string}      token
 */
export default async function saveTemplate(templateId, payload, token) {
  const url    = templateId ? templateRoute(templateId) : templatesRoute();
  const method = templateId ? 'PATCH' : 'PUT';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) return Promise.reject(handleApiError(res, data));
  return data;
}
