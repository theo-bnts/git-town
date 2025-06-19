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
