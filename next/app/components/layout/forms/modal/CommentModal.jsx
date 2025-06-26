'use client';
import { useState, useEffect, useMemo } from 'react';
import useAuthToken from '@/app/hooks/useAuthToken';
import getComment from '@/app/services/api/repositories/id/comment/getComment';
import saveComment from '@/app/services/api/repositories/id/comment/saveComment';
import TextArea from '@/app/components/ui/TextArea';
import FormModal from '@/app/components/ui/modal/FormModal';
import ModalBase from '@/app/components/ui/modal/ModalBase';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import { useNotification } from '@/app/context/NotificationContext';

export default function CommentModal({ 
  repositoryId, 
  isOpen, 
  onClose, 
  onSave,
  isArchived = false, 
}) {
  const token = useAuthToken();
  const notify = useNotification();

  const [comment, setComment] = useState('');
  const [fieldErrors, setErrs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    if (!token || !repositoryId) return;

    setLoading(true);
    getComment(repositoryId, token)
      .then(({ Comment }) => setComment(Comment || ''))
      .catch(e => notify(e.message || 'Erreur chargement commentaire', 'error'))
      .finally(() => setLoading(false));
  }, [isOpen, token, repositoryId, notify]);

  const fields = useMemo(() => [
    {
      name: 'Commentaire',
      value: comment,
      render: (v, setV) => (
        <TextArea
          value={v}
          onChange={e => setV(e.target.value)}
          rows={6}
          placeholder="Votre commentaire…"
        />
      ),
    },
  ], [comment]);

  const handleSubmit = async v => {
    const txt = v.Commentaire.trim();
    if (!txt) return setErrs({ Commentaire: 'Le commentaire ne peut pas être vide.' });
    setErrs({});
    try {
      await saveComment(repositoryId, txt, token);
      notify('Commentaire enregistré', 'success');
      onSave?.();
      onClose();
    } catch (e) {
      notify(e.message || 'Erreur enregistrement', 'error');
    }
  };

  if (!isOpen) return null;
  if (loading || !token) {
    return (
      <ModalBase isOpen title="Chargement…" onClose={onClose}>
        <div className="flex justify-center py-8">
          <LoadingSpinner size={40} />
        </div>
      </ModalBase>
    );
  }

  return (
    <FormModal
      formKey={`comment-${repositoryId}-${isOpen}`}
      isOpen
      title="Ajouter un commentaire"
      fields={fields}
      errors={fieldErrors}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={false}
      disableSubmit={isArchived}
    />
  );
}
