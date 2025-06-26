'use client';

export function normalizeString(str) {
  if (typeof str !== 'string') {
    str = String(str);
  }
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function highlightMatch(text, query) {
  if (!query) return text;
  if (typeof text !== 'string') text = String(text);
  const normalizedText = normalizeString(text);
  const normalizedQuery = normalizeString(query);
  const matchIndex = normalizedText.indexOf(normalizedQuery);
  if (matchIndex === -1) return text;

  return (
    <>
      {text.substring(0, matchIndex)}
      <strong>{text.substring(matchIndex, matchIndex + query.length)}</strong>
      {text.substring(matchIndex + query.length)}
    </>
  );
}
