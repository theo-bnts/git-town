'use client';

import React, { useEffect, useState, useCallback } from 'react';
import useAuthToken from '@/app/hooks/useAuthToken';
import { useNotification } from '@/app/context/NotificationContext';
import ImportModal from '@/app/components/ui/modal/ImportModal';
import { parseRepositoriesCsv } from '@/app/services/logic/importRepositories';
import saveRepositories from '@/app/services/api/repositories/saveRepositories';
import putUserRepository from '@/app/services/api/users/id/repositories/putUserRepository';
import getTemplates from '@/app/services/api/templates/getTemplates';
import getPromotions from '@/app/services/api/promotions/getPromotions';
import getUsers from '@/app/services/api/users/getUsers';

export default function ImportRepositoriesModal({ isOpen, onClose, onImport }) {
  const token = useAuthToken();
  const notify = useNotification();

  const [templateOpts, setTemplateOpts] = useState([]);
  const [promotionOpts, setPromotionOpts] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  useEffect(() => {
    if (!isOpen || !token) return;
    Promise.all([getTemplates(token), getPromotions(token)])
      .then(([tpls, proms]) => {
        setTemplateOpts(
          tpls.map(t => ({
            id: t.Id,
            value: `${t.EnseignementUnit.Initialism} - ${t.Year}`,
            full: t,
          }))
        );
        setPromotionOpts(
          proms.map(p => ({
            id: p.Id,
            value: `${p.Diploma.Initialism} ${p.PromotionLevel.Initialism} - ${p.Year}`,
            full: p,
          }))
        );
      })
      .catch(() => notify('Erreur lors du chargement des listes', 'error'));
  }, [isOpen, token, notify]);

  const processRows = useCallback(
    async (repositories, setProgress) => {
      if (!token) throw new Error('Authentification requise');

      const users = await getUsers(token);
      const emailToId = new Map(
        users.map(u => [u.EmailAddress.toLowerCase(), u.Id])
      );

      const rejected = [];
      for (let i = 0; i < repositories.length; i++) {
        const { tutorEmail, studentEmails } = repositories[i];
        try {
          const tutorId = emailToId.get(tutorEmail.toLowerCase());
          if (!tutorId) throw new Error(`Tuteur introuvable : ${tutorEmail}`);

          const repo = await saveRepositories(
            null,
            {
              Template: { Id: selectedTemplate.id },
              Promotion: { Id: selectedPromotion.id },
              User: { Id: tutorId },
            },
            token
          );

          await Promise.all(
            studentEmails.map(email => {
              const id = emailToId.get(email.toLowerCase());
              if (!id) throw new Error(`Étudiant introuvable : ${email}`);
              return putUserRepository(
                id,
                { Repository: { Id: repo.Id } },
                token
              );
            })
          );
        } catch (err) {
          rejected.push({
            tutorEmail,
            studentEmails: studentEmails.join('|'),
            reason: err.message,
          });
        } finally {
          setProgress(Math.round(((i + 1) / repositories.length) * 100));
        }
      }
      return rejected;
    },
    [token, selectedTemplate, selectedPromotion]
  );

  return (
    <ImportModal
      isOpen={isOpen}
      onClose={onClose}
      onImport={onImport}
      title="Import dépôts (CSV)"
      csvParser={parseRepositoriesCsv}
      processRows={processRows}
      rejectType="repositories"
      sampleFileName="sampleImportRepositories.csv"
      fields={[
        {
          label: 'Modèle',
          options: templateOpts,
          value: selectedTemplate,
          onSelect: setSelectedTemplate,
        },
        {
          label: 'Promotion',
          options: promotionOpts,
          value: selectedPromotion,
          onSelect: setSelectedPromotion,
        },
      ]}
    />
  );
}
