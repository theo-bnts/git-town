import { delUserRepositoryRoute } from "@/app/services/routes";
import { userRepositoryRoute } from '@/app/services/routes';
import { handleApiError } from "@/app/services/errorHandler";

/**
 * Supprime tous les dépôts d'un utilisateur.
 * (DELETE /users/:userId/repositories/:repoId)
 *
 * @param {string} userId - L'identifiant de l'utilisateur.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<void>}
 * @throws {Error} - En cas d'erreur lors de la suppression d'un dépôt.
 */

export default async function deleteUserRepository(userId, token) {
  const currentRepositories = await userRepositoryRoute(userId, token);

  await Promise.all(
    currentRepositories.map(async (repository) => {
      const repoId = repository.Id;
      const endpoint = delUserRepositoryRoute(userId, repoId);
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw handleApiError(res, data);
      }
    })
  );
}
