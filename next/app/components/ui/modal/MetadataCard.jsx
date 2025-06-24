import Card from '@/app/components/ui/Card';

export function MetadataCard({ createdAt, updatedAt }) {
  if (!createdAt && !updatedAt) return null;
  const fmt = d =>
    new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(d));

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <Card variant="info">
        {createdAt && <p className="text-sm">Créé le {fmt(createdAt)}</p>}
        {updatedAt && <p className="text-sm">Modifié le {fmt(updatedAt)}</p>}
      </Card>
    </div>
  );
}
