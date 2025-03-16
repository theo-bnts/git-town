// app/services/logic/importUsers.js

/**
 * Validates a CSV file containing user data
 * @param {File} file - The CSV file to validate
 * @returns {Promise<{isValid: boolean, errors: Array<{line: number, message: string}>}>}
 */
export const validateCsvFile = async (file) => {
  // Get the email domain from environment variable or fallback
  const EMAIL_DOMAIN_REGEX = process.env.NEXT_PUBLIC_EMAIL_DOMAIN_REGEX || '@example\\.com$';
  
  // Read file content
  const content = await file.text();
  const lines = content.split('\n');
  const errors = [];
  
  // Skip header if exists
  const startIndex = lines[0].includes('EmailAddress,FullName,Role') ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const lineNumber = i + 1;
    const lineValidation = validateCsvLine(line, EMAIL_DOMAIN_REGEX);
    
    if (!lineValidation.isValid) {
      errors.push({
        line: lineNumber,
        message: lineValidation.error
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates a single CSV line
 * @param {string} line - CSV line to validate
 * @param {string} emailDomainRegex - Regex pattern for email domain validation
 * @returns {{isValid: boolean, error: string|null}}
 */
const validateCsvLine = (line, emailDomainRegex) => {
  // Parse CSV line - handles simple CSV format
  // This is a basic implementation. For complex CSVs with quotes and commas inside fields,
  // you'd need a proper CSV parser.
  const parts = line.split(',');
  if (parts.length < 3) {
    return {
      isValid: false,
      error: `Invalid CSV format. Expected at least 3 fields but got ${parts.length}`
    };
  }
  
  const email = parts[0].trim();
  const fullName = parts[1].trim();
  const role = parts[2].trim();
  
  // Validate email
  const emailValidation = validateEmail(email, emailDomainRegex);
  if (!emailValidation.isValid) {
    return emailValidation;
  }
  
  // Validate full name
  const nameValidation = validateFullName(fullName);
  if (!nameValidation.isValid) {
    return nameValidation;
  }
  
  // Validate role
  const roleValidation = validateRole(role);
  if (!roleValidation.isValid) {
    return roleValidation;
  }
  
  return { isValid: true, error: null };
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @param {string} domainRegex - Domain regex pattern
 * @returns {{isValid: boolean, error: string|null}}
 */
const validateEmail = (email, domainRegex) => {
  // Basic email validation
  const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!basicEmailRegex.test(email)) {
    return {
      isValid: false,
      error: `Invalid email format: ${email}`
    };
  }
  
  // Domain-specific validation
  const domainPattern = new RegExp(domainRegex);
  if (!domainPattern.test(email)) {
    return {
      isValid: false,
      error: `Email domain not allowed: ${email}`
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validates that full name contains only uppercase letters
 * @param {string} fullName - Full name to validate
 * @returns {{isValid: boolean, error: string|null}}
 */
const validateFullName = (fullName) => {
  // Check if contains only uppercase letters and spaces
  const uppercaseNameRegex = /^[A-Z\s]+$/;
  if (!uppercaseNameRegex.test(fullName)) {
    return {
      isValid: false,
      error: `Full name must contain only uppercase letters: ${fullName}`
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validates that role is one of the allowed values
 * @param {string} role - Role to validate
 * @returns {{isValid: boolean, error: string|null}}
 */
const validateRole = (role) => {
  const allowedRoles = ['student', 'teacher', 'administrator'];
  
  // Strip any quotes that might be present in the CSV
  const cleanRole = role.replace(/["']/g, '').toLowerCase().trim();
  
  if (!allowedRoles.includes(cleanRole)) {
    return {
      isValid: false,
      error: `Invalid role: ${role}. Must be one of: student, teacher, administrator`
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Parses and validates a CSV file, returning structured user data
 * @param {File} file - The CSV file to process
 * @returns {Promise<{isValid: boolean, errors: Array, users: Array}>}
 */
export const processCsvFile = async (file) => {
  const validation = await validateCsvFile(file);
  
  if (!validation.isValid) {
    return {
      isValid: false,
      errors: validation.errors,
      users: []
    };
  }
  
  // Process file to extract valid user data
  const content = await file.text();
  const lines = content.split('\n');
  const users = [];
  
  // Skip header if exists
  const startIndex = lines[0].includes('EmailAddress,FullName,Role') ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    users.push({
      EmailAddress: parts[0].trim(),
      FullName: parts[1].trim(),
      Role: {
        Keyword: parts[2].trim().replace(/["']/g, '')
      }
    });
  }
  
  return {
    isValid: true,
    errors: [],
    users
  };
};
