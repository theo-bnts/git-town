'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { templateMilestoneRoute, templateMilestonesRoute } from '@/app/services/routes';

/**
 * PUT  /templates/:id/milestones          (création)
 * PATCH /templates/:id/milestones/:msId   (édition)
 */
export default async function saveTemplateMilestone(templateId, milestoneId, payload, token) {
  const url    = milestoneId
    ? templateMilestoneRoute(templateId, milestoneId)
    : templateMilestonesRoute(templateId);
  const method = milestoneId ? 'PATCH' : 'PUT';

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
