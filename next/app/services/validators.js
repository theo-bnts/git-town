// app/services/validators.js

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
