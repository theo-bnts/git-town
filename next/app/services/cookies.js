// app/services/cookies.js
import Cookies from 'js-cookie';

export const setCookie = (key, value, options = {}) => {
  const validTime = new Date(Date.now() + 60 * 60 * 1000);
  const defaultOptions = { expires: validTime, sameSite: 'lax', path: '/'};
  return Cookies.set(key, value, { ...defaultOptions, ...options });
};

export const getCookie = (key) => Cookies.get(key);

export const removeCookie = (key) => Cookies.remove(key);
