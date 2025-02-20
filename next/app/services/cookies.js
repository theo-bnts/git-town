// app/services/cookies.js
import Cookies from 'js-cookie';

const defaultOptions = { expires: 7, sameSite: 'strict', path: '/' };

export const setCookie = (key, value, options = {}) => {
  return Cookies.set(key, value, { ...defaultOptions, ...options });
};

export const getCookie = (key) => Cookies.get(key);

export const removeCookie = (key) => Cookies.remove(key);
