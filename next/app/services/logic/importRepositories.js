import { isEmailValid } from '@/app/services/validators';

export async function parseRepositoriesCsv(file) {
  try {
    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    const errors = [];
    let startIndex = 0;
    const headerRegex = /^TEACHER_MAIL\s*;\s*STUDENTS_MAIL$/i;
    if (headerRegex.test(lines[0])) {
      startIndex = 1;
    } else if (lines[0].includes(';')) {
      errors.push({
        line: 1,
        field: 'header',
        message: `Entête inattendue : "${lines[0]}"`,
        value: lines[0]
      });
    }

    const repositories = [];

    for (let i = startIndex; i < lines.length; i++) {
      const lineNumber = i + 1;
      const rawLine = lines[i];
      const [rawTeacher = '', rawStudents = ''] = rawLine
        .split(';')
        .map(c => c.trim());

      if (rawTeacher.includes(',')) {
        errors.push({
          line: lineNumber,
          field: 'tutorEmail',
          message: 'Un seul email tuteur est autorisé (pas de virgule)',
          value: rawTeacher
        });
        
        continue;
      }

      if (/^[^@]+@etud\.u-picardie\.fr$/i.test(rawTeacher)) {
        errors.push({
          line: lineNumber,
          field: 'tutorEmail',
          message: `L'email tuteur "${rawTeacher}" ne peut pas être un compte étudiant`,
          value: rawTeacher
        });

        continue;
      }

      if (!rawTeacher || !isEmailValid(rawTeacher)) {
        errors.push({
          line: lineNumber,
          field: 'tutorEmail',
          message: 'Email tuteur invalide',
          value: rawTeacher
        });

        continue;
      }

      const studentList = rawStudents
        .split(',')
        .map(e => e.trim())
        .filter(Boolean);

      if (studentList.length === 0) {
        errors.push({
          line: lineNumber,
          field: 'studentEmails',
          message: 'Aucun email étudiant fourni',
          value: rawStudents
        });

        continue;
      }

      const invalids = studentList.filter(e => !isEmailValid(e));
      if (invalids.length > 0) {
        errors.push({
          line: lineNumber,
          field: 'studentEmails',
          message: `Emails étudiants invalides : ${invalids.join(',')}`,
          value: invalids.join(',')
        });

        continue;
      }

      repositories.push({
        tutorEmail: rawTeacher,
        studentEmails: studentList
      });
    }

    const rejectLines = ['ERROR;LINE;FIELD;REASON;VALUE'];
    errors.forEach(err => {
      rejectLines.push(
        ['ERROR', err.line, err.field, err.message, err.value].join(';')
      );
    });

    return {
      isValid: errors.length === 0,
      rows: repositories,
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
