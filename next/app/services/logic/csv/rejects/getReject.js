export default async function getReject(type) {
  if (!type) 
    throw new Error('Type de rejet non spécifié.');

  const res = await fetch(`/api/csv/rejects/${encodeURIComponent(type)}`);
  if (!res.ok) 
    throw new Error('Impossible de récupérer la liste des rejets.');

  const { files } = await res.json();
  
  return files;
}
