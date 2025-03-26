// /app/utils/stringUtils.js
'use client';

export function normalizeString(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function highlightMatch(text, query) {
  if (!query) return text;
  const matchIndex = normalizeString(text).indexOf(normalizeString(query));
  if (matchIndex === -1) return text;

  return (
    <>
      {text.substring(0, matchIndex)}
      <strong>{text.substring(matchIndex, matchIndex + query.length)}</strong>
      {text.substring(matchIndex + query.length)}
    </>
  );
}
