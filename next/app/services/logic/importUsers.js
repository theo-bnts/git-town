import { isEmailValid } from '@/app/services/validators';

export async function processCsvFile(file) {
  try {
    const validRoles = ['student', 'teacher', 'administrator'];
    const text = await file.text();

    const lines = text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return {
        isValid: false,
        rows: [],
        errors: [{
          line: 1,
          field: null,
          message: 'Fichier CSV vide',
          value: ''
        }],
        rejectCsv: [
          'ERROR;REASON',
          `1;Fichier CSV vide`
        ].join('\n')
      };
    }

    const errors = [];
    let startIndex = 0;
    const headerRegex = /^EMAIL_ADDRESS\s*;\s*FULL_NAME\s*;\s*ROLE_KEYWORD$/i;
    if (headerRegex.test(lines[0])) {
      startIndex = 1;
    } else if (lines[0].includes(';')) {
      errors.push({
        line: 1,
        field: 'header',
        message: `Entête CSV inattendue: "${lines[0]}"`,
        value: lines[0]
      });
    }

    const users = [];
    const seenEmails = new Set();

    for (let i = startIndex; i < lines.length; i++) {
      const lineNumber = i + 1;
      const rawLine = lines[i];
      const parts = rawLine.split(';').map(s => s.trim());

      const rawEmail = parts[0] || '';
      const rawFullName = parts[1] || '';
      const rawRole = parts[2] || '';

      const email = rawEmail;
      const fullName = rawFullName.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s]/g, '').trim();
      const role = rawRole.replace(/['"]/g, '').trim().toLowerCase();

      if (/^[^@]+@etud\.u-picardie\.fr$/i.test(email) && role !== 'student') {
        errors.push({
          line: lineNumber,
          field: 'Role',
          message: `"${email}" ne peut pas avoir le rôle "${role}"`,
          value: rawRole
        });

        continue;
      }

      if (parts.length < 3) {
        errors.push({ line: lineNumber, field: 'format', message: 'Format CSV invalide', value: rawLine });
        continue;
      }
      if (!email || !isEmailValid(email)) {
        errors.push({ line: lineNumber, field: 'EmailAddress', message: 'Email mauvais format', value: rawEmail });
        continue;
      }
      if (seenEmails.has(email)) {
        errors.push({ line: lineNumber, field: 'EmailAddress', message: 'Email en doublon', value: rawEmail });
        continue;
      }
      if (!fullName) {
        errors.push({ line: lineNumber, field: 'FullName', message: 'Nom complet vide ou invalide', value: rawFullName });
        continue;
      }
      if (!validRoles.includes(role)) {
        errors.push({ line: lineNumber, field: 'Role', message: `Rôle incorrect: "${rawRole}"`, value: rawRole });
        continue;
      }

      seenEmails.add(email);
      users.push({
        EmailAddress: email,
        FullName: fullName,
        Role: { Keyword: role }
      });
    }

    const rejectLines = ['ERROR;LINE;FIELD;REASON;VALUE'];
    errors.forEach(err => {
      rejectLines.push([
        'ERROR',
        err.line,
        err.field || '',
        err.message,
        err.value
      ].join(';'));
    });

    return {
      isValid: errors.length === 0,
      rows: users,
      errors,
      rejectCsv: rejectLines.join('\n')
    };
  } catch (err) {
    const msg = err.message || 'Erreur inattendue';
    return {
      isValid: false,
      rows: [],
      errors: [{ line: null, field: null, message: msg, value: null }],
      rejectCsv: ['ERROR;REASON', `0;${msg}`].join('\n')
    };
  }
}
