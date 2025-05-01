import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { XIcon } from '@primer/octicons-react';

export function ErrorCard({ message, onClear }) {
  if (!message) return null;
  return (
    <Card variant="warn" className="mt-4 w-full">
      <div className="flex items-center">
        <p className="flex-1">{message}</p>
        <Button variant="cancel_action_sq" onClick={onClear}>
          <XIcon size={20} />
        </Button>
      </div>
    </Card>
  );
}
