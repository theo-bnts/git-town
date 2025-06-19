// next/app/services/logic/importRepositories.js
// -------------------------------------------------
// Front‑end CSV validator & parser for bulk repository creation.
// Expose a named export `parseRepositoriesCsv(file)`.
// -------------------------------------------------

/**
 * parseRepositoriesCsv(file: File)
 * - Reads a CSV file where each row describes one repository.
 * - Each row must contain at least one non-student email (tutor)
 *   and at least one student email (domain: etud.u-picardie.fr).
 * - Returns { isValid: boolean, repositories: Array, rejectCsv: string }
 *   where repositories = [{ tutorEmail, studentEmails: [] }, ...]
 */
export async function parseRepositoriesCsv(file) {
  const text = await file.text();
  const lines = text.split(/\r?\n/);
  const repositories = [];
  const rejectRows = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const cells = line.split(/[,;]+/).map(c => c.trim()).filter(Boolean);
    const tutorEmails = cells.filter(e => !/^[^@]+@etud\.u-picardie\.fr$/.test(e));
    const studentEmails = cells.filter(e => /^[^@]+@etud\.u-picardie\.fr$/.test(e));

    if (tutorEmails.length < 1 || studentEmails.length < 1) {
      // invalid: missing tutor or student
      rejectRows.push(line);
      continue;
    }

    repositories.push({
      tutorEmail: tutorEmails[0],
      studentEmails,
    });
  }

  const isValid = rejectRows.length === 0;
  let rejectCsv = '';
  if (!isValid) {
    rejectCsv = rejectRows.join('\n');
  }

  return { isValid, rows: repositories, rejectCsv };
}
