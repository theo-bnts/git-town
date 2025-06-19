export async function processCsvFile(file) {
  const validRoles = ['student', 'teacher', 'administrator'];
  const text = await file.text();

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      isValid: false,
      users: [],
      errors: [{
        line : 1,
        message : 'Fichier CSV vide.',
        EmailAddress: '',
        FullName : '',
        Role : { Keyword: '' }
      }],
      rejectCsv: [
        'EMAIL_ADDRESS,FULL_NAME,ROLE_KEYWORD,REASON',
        'Ligne 1 - Format Incorrect : ""'
      ].join('\n')
    };
  }

  let startIndex = 0;
  if (/^EMAIL_ADDRESS\s*,\s*FULL_NAME\s*,\s*ROLE_KEYWORD\s*$/i.test(lines[0])) {
    startIndex = 1;
  }

  const users = [];
  const errors = [];
  const seenEmails = new Set();

  for (let i = startIndex; i < lines.length; i++) {
    const lineNumber = i + 1;
    const rawLine = lines[i];
    const parts = rawLine.split(',').map((s) => s.trim());

    const rawEmail = parts[0] || '';
    const rawFullName = parts[1] || '';
    const rawRole = parts[2] || '';

    const email = rawEmail;
    const fullName = rawFullName.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s]/g, '').trim();
    const role = rawRole.replace(/['"]/g, '').trim().toLowerCase();

    const reasons = [];
    if (parts.length < 3) {
      reasons.push('Format CSV invalide');
    }
    if (!email || !new RegExp(process.env.NEXT_PUBLIC_USER_EMAIL_ADDRESS_PATTERN, 'u').test(email)) {
      reasons.push('Email mauvais format');
    }
    if (seenEmails.has(email)) {
      reasons.push('Email en doublon');
    }
    if (!fullName) {
      reasons.push('Nom complet vide ou invalide');
    }
    if (!validRoles.includes(role)) {
      reasons.push('Rôle incorrect');
    }

    if (reasons.length > 0) {
      errors.push({
        line : lineNumber,
        message : reasons.join(' ; '),
        EmailAddress: rawEmail,
        FullName : rawFullName,
        Role : { Keyword: rawRole },
        reasons,
        rawLine,
        rawEmail,
        rawFullName,
        rawRole
      });
      continue;
    }

    seenEmails.add(email);
    users.push({
      EmailAddress : email,
      FullName : fullName,
      Role : { Keyword: role }
    });
  }

  const rejectLines = ['EMAIL_ADDRESS,FULL_NAME,ROLE_KEYWORD,REASON'];
  for (const err of errors) {
    const segments = err.reasons.map((r) => {
      switch (r) {
        case 'Format CSV invalide':
          return `Format Incorrect : "${err.rawLine}"`;
        case 'Email mauvais format':
          return `Email mauvais format : "${err.rawEmail}"`;
        case 'Email en doublon':
          return `Email en doublon : "${err.rawEmail}"`;
        case 'Nom complet vide ou invalide':
          return `Nom complet vide ou invalide : "${err.rawFullName}"`;
        case 'Rôle incorrect':
          return `Rôle incorrect : "${err.rawRole}"`;
        default:
          return r;
      }
    });
    rejectLines.push(`Ligne ${err.line} - ${segments.join(' ; ')}`);
  }

  return {isValid: errors.length === 0, rows: users, rejectCsv: rejectLines.join('\n')};
}
