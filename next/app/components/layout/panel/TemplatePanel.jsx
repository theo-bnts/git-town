'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@primer/octicons-react';
import { getCookie } from '@/app/services/cookies';
import getTemplates from '@/app/services/api/templates/getTemplates';
import getTemplateMilestones from '@/app/services/api/templates/id/milestone/getTemplateMilestones';
import deleteTemplate from '@/app/services/api/templates/id/deleteTemplate';

import Table from '@/app/components/layout/table/Table';
import Button from '@/app/components/ui/Button';
import ConfirmCard from '@/app/components/ui/ConfirmCard';
import TemplateModal from '@/app/components/layout/forms/modal/TemplateModal';

const columns = [
  { key: 'year', title: 'Année', sortable: true},
  { key: 'ue', title: 'UE', sortable: true},
  { key: 'milestones', title: 'Nombre de jalons', sortable: true},
  { key: 'actions', title: 'Action(s)', sortable: false},
];

export default function TemplatePanel() {
  const [authToken, setAuthToken] = useState('');
  const [rows, setRows] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateBeingEdited, setTemplate] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  useEffect(() => {
    (async () => {
      const token = await getCookie('token');
      setAuthToken(token);
    })();
  }, []);

  const refreshList = useCallback(async () => {
    if (!authToken) return;
    const templates = await getTemplates(authToken);
    const enriched = await Promise.all(
      templates.map(async tpl => {
        const ms = await getTemplateMilestones(tpl.Id, authToken);
        return {
          raw: tpl,
          year: tpl.Year,
          ue: `${tpl.EnseignementUnit.Name} (${tpl.EnseignementUnit.Initialism})`,
          milestones: Array.isArray(ms) ? ms.length : 0,
        };
      })
    );
    const withActions = enriched.map(row => ({
      ...row,
      actions: [
        {
          icon: <PencilIcon size={16} />,
          onClick: () => {
            setTemplate({
              Id: row.raw.Id,
              EnseignementUnit: row.raw.EnseignementUnit,
              Year: row.raw.Year,
              CreatedAt: row.raw.CreatedAt,
              UpdatedAt: row.raw.UpdatedAt,
            });
            setIsModalOpen(true);
          }
        },
        {
          icon: <TrashIcon size={16} />,
          onClick: () => {
            setTemplateToDelete(row);
            setIsConfirmOpen(true);
          }
        }
      ]
    }));
    setRows(withActions);
  }, [authToken]);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const toolbar = (
    <Button
      variant="default_sq"
      onClick={() => {
        setTemplate(null);
        setIsModalOpen(true);
      }}
    >
      <PlusIcon size={24} className="text-white" />
    </Button>
  );

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    try {
      await deleteTemplate(templateToDelete.raw.Id, authToken);
      await refreshList();
    } catch (err) {
      alert(`Suppression impossible : ${err.message}`);
    } finally {
      setIsConfirmOpen(false);
      setTemplateToDelete(null);
    }
  };

  return (
    <>
      <Table columns={columns} data={rows} toolbarContents={toolbar} />

      {isModalOpen && (
        <TemplateModal
          isOpen={isModalOpen}
          initialData={templateBeingEdited || {}}
          onClose={() => {
            setIsModalOpen(false);
            setTemplate(null);
          }}
          onSave={async () => {
            await refreshList();
            setIsModalOpen(false);
            setTemplate(null);
          }}
        />
      )}

      {isConfirmOpen && (
        <ConfirmCard
          message={<>Supprimer le template <strong>{templateToDelete?.ue}</strong> ?</>}
          onConfirm={confirmDelete}
          onCancel={() => {
            setIsConfirmOpen(false);
            setTemplateToDelete(null);
          }}
        />
      )}
    </>
  );
}
