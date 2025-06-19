export default async function deleteRejec(type, name) {
  if (!type) 
    throw new Error('Type de rejet non spécifié.');

  const res = await fetch(`/api/csv/rejects/${encodeURIComponent(type)}/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });

  if (!res.ok) 
    throw new Error('Suppression impossible.');
}
