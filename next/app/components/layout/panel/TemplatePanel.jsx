'use client';

import { useState, useEffect, useCallback } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@primer/octicons-react';

import { getCookie } from '@/app/services/cookies';
import getTemplates from '@/app/services/api/templates/getTemplates';
import deleteTemplate from '@/app/services/api/templates/id/deleteTemplate';

import Table from '@/app/components/layout/table/Table';
import Button from '@/app/components/ui/Button';
import ConfirmCard from '@/app/components/ui/ConfirmCard';
import TemplateModal from '@/app/components/layout/forms/modal/TemplateModal';

const columns = [
  { key: 'year',  title: 'Année',  sortable: true },
  { key: 'ue',    title: 'UE',     sortable: true },
  { key: 'milestones', title: 'Nombre de jalons', sortable: true },
  { key: 'actions',    title: 'Action(s)', sortable: false },
];

const mapTemplateToRow = (tpl) => ({
  raw: tpl,
  year: tpl.Year,
  ue: `${tpl.EnseignementUnit.Name} (${tpl.EnseignementUnit.Initialism})`,
  milestones: 0,
});

export default function TemplatePanel() {
  const [authToken, setAuthToken]   = useState('');
  const [templates, setTemplates]   = useState([]);

  const [modalOpen, setModalOpen]   = useState(false);
  const [selectedTpl, setSelectedTpl] = useState(null);

  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [tplToDelete, setTplToDelete]     = useState(null);

  useEffect(() => {
    (async () => setAuthToken(await getCookie('token')))();
  }, []);

  const refresh = useCallback(() => {
    if (!authToken) return;
    getTemplates(authToken)
      .then((data) => {
        const rows = data
          .map(mapTemplateToRow)
          .map((row) => ({ ...row, actions: renderActions(row) }));
        setTemplates(rows);
      })
      .catch((err) => alert(`Erreur de chargement : ${err.message}`));
  }, [authToken]);

  useEffect(() => { refresh(); }, [refresh]);

  const renderActions = (row) => [
    {
      icon: <PencilIcon size={16} />,
      onClick: () => {
        setSelectedTpl({
          Id: row.raw.Id,
          EnseignementUnit: row.raw.EnseignementUnit,
          Year: row.raw.Year,
          createdAt: row.raw.CreatedAt,
          updatedAt: row.raw.UpdatedAt,
        });
        setModalOpen(true);
      },
    },
    {
      icon: <TrashIcon size={16} />,
      onClick: () => {
        setTplToDelete(row);
        setConfirmOpen(true);
      },
    },
  ];

  const toolbarContents = (
    <Button variant="default_sq" onClick={() => {
      setSelectedTpl(null);
      setModalOpen(true);
    }}>
      <PlusIcon size={24} className="text-white" />
    </Button>
  );

  const confirmDelete = async () => {
    if (!tplToDelete) return;
    try {
      await deleteTemplate(tplToDelete.raw.Id, authToken);
      refresh();
    } catch (err) {
      alert(`Suppression impossible : ${err.message}`);
    }
    setConfirmOpen(false);
    setTplToDelete(null);
  };

  return (
    <>
      <Table columns={columns} data={templates} toolbarContents={toolbarContents} />

      {modalOpen && (
        <TemplateModal
          isOpen={modalOpen}
          initialData={selectedTpl || {}}
          onClose={() => { setModalOpen(false); setSelectedTpl(null); }}
          onSave={() => { refresh(); setModalOpen(false); setSelectedTpl(null); }}
        />
      )}

      {confirmOpen && (
        <ConfirmCard
          message={<>Supprimer le template <strong>{tplToDelete?.ue}</strong> ?</>}
          onConfirm={confirmDelete}
          onCancel={() => { setConfirmOpen(false); setTplToDelete(null); }}
        />
      )}
    </>
  );
}
