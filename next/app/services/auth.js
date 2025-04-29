// app/services/auth.js

import { Buffer } from "buffer";

export function encodeUserInfo({ fullName, role }) {
  const jsonString = JSON.stringify({ fullName, role });
  return Buffer.from(jsonString, "utf8").toString("base64url");
}

export function decodeUserInfo(rawBase64Url) {
  if (!rawBase64Url) {
    return null;
  }
  try {
    const jsonString = Buffer.from(rawBase64Url, "base64url").toString("utf8");
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}
