// app/services/logic/importUsers.js

export async function processCsvFile(file) {
  const emailRegexPattern = process.env.NEXT_PUBLIC_USER_EMAIL_ADDRESS_PATTERN;
  const text = await file.text();
  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  if (rawLines.length === 0) {
    return {
      isValid: false,
      errors: [{ line: 1, message: 'Fichier CSV vide.' }],
      users: []
    };
  }

  let startIndex = 0;
  if (/^EMAIL_ADDRESS\s*,\s*FULL_NAME\s*,\s*ROLE_KEYWORD\s*$/i.test(rawLines[0])) {
    startIndex = 1;
  }

  const regexEmail = new RegExp(emailRegexPattern, 'u');
  const validRoles = ['student', 'teacher', 'administrator'];

  const errors = [];
  const users = [];

  for (let i = startIndex; i < rawLines.length; i++) {
    const lineNumber = i + 1;
    const line = rawLines[i];
    const parts = line.split(',').map((x) => x.trim());

    if (parts.length < 3) {
      errors.push({
        line: lineNumber,
        message: `Format CSV invalide. 3 champs requis, trouvés: ${parts.length}`
      });
      continue;
    }

    let [rawEmail, rawFullName, rawRole] = parts;

    const email = rawEmail.trim();
    let fullName = rawFullName.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s]/g, '').trim();
    const role = rawRole.replace(/["']/g, '').trim().toLowerCase();

    if (!email || !regexEmail.test(email)) {
      errors.push({
        line: lineNumber,
        message: `Adresse email invalide : "${email}"`
      });
      continue;
    }

    if (!fullName) {
      errors.push({
        line: lineNumber,
        message: 'Le nom complet est vide ou invalide après parsing'
      });
      continue;
    }

    if (!validRoles.includes(role)) {
      errors.push({
        line: lineNumber,
        message: `Rôle "${rawRole}" invalide. Autorisés: ${validRoles.join(', ')}`
      });
      continue;
    }

    users.push({
      EmailAddress: email,
      FullName: fullName,
      Role: { Keyword: role }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    users
  };
}
