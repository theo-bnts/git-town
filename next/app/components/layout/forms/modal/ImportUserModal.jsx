'use client';

import React, { useEffect, useState, useCallback } from 'react';
import useAuthToken from '@/app/hooks/useAuthToken';
import { useNotification } from '@/app/context/NotificationContext';
import ImportModal from '@/app/components/ui/modal/ImportModal';
import { processCsvFile as parseUsersCsv } from '@/app/services/logic/importUsers';
import saveUser from '@/app/services/api/users/saveUser';
import getPromotions from '@/app/services/api/promotions/getPromotions';

export default function ImportUsersModal({ isOpen, onClose, onImport }) {
  const token = useAuthToken();
  const notify = useNotification();

  const [promoOpts, setPromoOpts] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);

  useEffect(() => {
    if (!isOpen || !token) return;
    getPromotions(token)
      .then(proms =>
        setPromoOpts(
          proms.map(p => ({
            id: p.Id,
            value: `${p.Diploma.Initialism} ${p.PromotionLevel.Initialism} - ${p.Year}`.replace('–', '-'),
            full: p,
          }))
        )
      )
      .catch(() => notify('Erreur lors du chargement des promotions', 'error'));
  }, [isOpen, token, notify]);

  const processRows = useCallback(
    async (users, setProgress) => {
      if (!token) throw new Error('Authentification requise');
      const rejected = [];
      for (let i = 0; i < users.length; i++) {
        const row = users[i];
        try {
          const created = await saveUser(null, row, token);
          const newId = created?.Id || created?.id;
          if (!newId) throw new Error('Création utilisateur sans identifiant');
          if (row.Role?.Keyword === 'student') {
            await saveUser(newId, { Promotions: [selectedPromo.id] }, token);
          }
        } catch (err) {
          rejected.push({
            EmailAddress: row.EmailAddress,
            FullName: row.FullName,
            Role: row.Role?.Keyword || '',
            reason: err.message,
          });
        } finally {
          setProgress(Math.round(((i + 1) / users.length) * 100));
        }
      }
      return rejected;
    },
    [token, selectedPromo]
  );

  return (
    <ImportModal
      isOpen={isOpen}
      onClose={onClose}
      onImport={onImport}
      title="Import utilisateurs"
      csvParser={parseUsersCsv}
      processRows={processRows}
      rejectType="users"
      sampleFileName="sampleImportUsers.csv"
      fields={[
        {
          label: 'Promotion',
          options: promoOpts,
          value: selectedPromo,
          onSelect: setSelectedPromo,
        },
      ]}
    />
  );
}
