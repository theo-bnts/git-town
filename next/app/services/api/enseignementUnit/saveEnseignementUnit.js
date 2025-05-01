'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { enseignementUnitRoute, enseignementUnitsRoute } from '@/app/services/routes';

/**
 * Crée ou modifie une unité d’enseignement.
 * - PUT  /enseignement-units         (création)
 * - PATCH /enseignement-units/:id    (modification)
 *
 * @param {string|null} unitId  - Id de l'UE (null pour création)
 * @param {object}      payload - { Initialism, Name }
 * @param {string}      token   - Token d'authentification
 * @returns {Promise<object>}   - UE créée ou modifiée
 */
export default async function saveEnseignementUnit(unitId, payload, token) {
  const url    = unitId ? enseignementUnitRoute(unitId) : enseignementUnitsRoute();
  const method = unitId ? 'PATCH' : 'PUT';

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

  if (!res.ok) {
    return Promise.reject(handleApiError(res, data));
  }
  return data;
}
