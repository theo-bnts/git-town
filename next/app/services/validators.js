export const isEmailValid = (email) => {
  const pattern = new RegExp(process.env.NEXT_PUBLIC_USER_EMAIL_ADDRESS_PATTERN, 'u');
  return pattern.test(email.trim());
};

export const isPasswordValid = (password) => {
  const minLength = Number(process.env.NEXT_PUBLIC_USER_PASSWORD_MIN_LENGTH);
  return password.length >= minLength;
};

export const isTokenValid = (token) => {
  const pattern = Number(process.env.NEXT_PUBLIC_USER_TOKEN_LENGTH);
  return token.length === pattern;
}

export const isYearValid = (year) => {
  const length = Number(process.env.NEXT_PUBLIC_USER_YEAR_LENGTH);
  const pattern = new RegExp(process.env.NEXT_PUBLIC_USER_YEAR_RANGE_PATTERN, 'u');
  return year.length === length && pattern.test(year);
}

export const isUEInitialismValid = (initialism) => {
  const pattern = new RegExp(process.env.NEXT_PUBLIC_UE_NAME_PATTERN, 'u');
  return pattern.test(initialism.trim().toUpperCase());
}

export const isUENameValid = (name) => {
  const length = Number(process.env.NEXT_PUBLIC_UE_NAME_LENGTH);
  return name.length <= length;
}

