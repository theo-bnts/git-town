import Card from '@/app/components/ui/Card';
import { textStyles } from '@/app/styles/tailwindStyles';

export function MetadataCard({ createdAt, updatedAt }) {
  if (!createdAt && !updatedAt) return null;

  const fmt = d =>
    new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(d));

  return (
    <div className="fixed top-4 left-4 z-[100]">
      <Card variant="info">
        {createdAt && (
          <p>
            Créé le <span className={textStyles.bold}>{fmt(createdAt)}</span>
          </p>
        )}
        {updatedAt && (
          <p>
            Modifié le <span className={textStyles.bold}>{fmt(updatedAt)}</span>
          </p>
        )}
      </Card>
    </div>
  );
}
