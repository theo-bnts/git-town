// app/services/csv/rejects/getRejectFiles.js
export default async function getRejectFiles() {
  const res = await fetch('/api/csv/rejects');
  if (!res.ok) throw new Error('Impossible de récupérer la liste des rejets.');
  const { files } = await res.json();
  return files;
}