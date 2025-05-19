// app/services/csv/rejects/deleteRejectFile.js
export default async function deleteRejectFile(name) {
  const res = await fetch(`/api/csv/rejects/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Suppression impossible.');
}