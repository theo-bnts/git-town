'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { templateMilestoneRoute } from '@/app/services/routes';

/** DELETE /templates/:id/milestones/:msId */
export default async function deleteTemplateMilestone(templateId, milestoneId, token) {
  const url = templateMilestoneRoute(templateId, milestoneId);
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) return Promise.reject(handleApiError(res, data));
  return data;
}
