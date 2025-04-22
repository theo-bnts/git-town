'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { templateMilestonesRoute } from '@/app/services/routes';

/** GET /templates/:id/milestones */
export default async function getTemplateMilestones(templateId, token) {
  const url = templateMilestonesRoute(templateId);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  const text = await res.text();
  const data = text ? JSON.parse(text) : [];

  if (!res.ok) return Promise.reject(handleApiError(res, data));
  return data;
}
