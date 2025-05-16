export default async function deleteRejectFile(fileName) {
  const res = await fetch(
    `/api/csv/rejects/${encodeURIComponent(fileName)}`,
    { method: 'DELETE' }
  );
  if (!res.ok) throw new Error('Suppression impossible.');
}
