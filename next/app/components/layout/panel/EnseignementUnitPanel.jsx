'use client';

import { useState, useEffect, useCallback } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@primer/octicons-react';

import { getCookie } from '@/app/services/cookies';
import getEnseignementUnits from '@/app/services/api/enseignementUnit/getEnseignementUnits';
import deleteEnseignementUnit from '@/app/services/api/enseignementUnit/id/deleteEnseignementUnit';

import Table from '@/app/components/layout/table/Table';
import Button from '@/app/components/ui/Button';
import ConfirmCard from '@/app/components/ui/ConfirmCard';
import EnseignementUnitModal from '@/app/components/layout/forms/modal/EnseignementUnitModal';

const columns = [
  { key: 'initialism', title: 'Sigle', sortable: true },
  { key: 'name',       title: 'Nom',   sortable: true },
  { key: 'actions',    title: 'Action(s)', sortable: false },
];

const mapUnitToRow = (unit) => ({
  raw: unit,
  initialism: unit.Initialism,
  name: unit.Name,
});

export default function EnseignementUnitPanel() {
  const [authToken, setAuthToken]       = useState('');
  const [units, setUnits]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [modalOpen, setModalOpen]       = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);

  // Récupération du token au montage
  useEffect(() => {
    (async () => {
      const t = await getCookie('token');
      setAuthToken(t);
    })();
  }, []);

  // Déclaration avant usage dans refreshUnits :
  const renderActions = (row) => [
    {
      icon: <PencilIcon size={16} />,
      onClick: () => {
        setSelectedUnit({
          Id:         row.raw.Id,
          Initialism: row.raw.Initialism,
          Name:       row.raw.Name,
          createdAt:  row.raw.CreatedAt,
          updatedAt:  row.raw.UpdatedAt,
        });
        setModalOpen(true);
      },
    },
    {
      icon: <TrashIcon size={16} />,
      onClick: () => {
        setUnitToDelete(row);
        setConfirmOpen(true);
      },
    },
  ];

  // Chargement manuel des unités + gestion du loading
  const refreshUnits = useCallback(() => {
    if (!authToken) return;
    setLoading(true);
    getEnseignementUnits(authToken)
      .then((data) => {
        const withActions = data
          .map(mapUnitToRow)
          .map(row => ({
            ...row,
            actions: renderActions(row),
          }));
        setUnits(withActions);
      })
      .catch((err) => alert(`Erreur de chargement : ${err.message}`))
      .finally(() => setLoading(false));
  }, [authToken]);

  useEffect(() => {
    refreshUnits();
  }, [refreshUnits]);

  // Contenu de la barre d’outils
  const toolbarContents = (
    <Button
      variant="default_sq"
      onClick={() => {
        setSelectedUnit(null);
        setModalOpen(true);
      }}
    >
      <PlusIcon size={24} className="text-white" />
    </Button>
  );

  // Suppression confirmée
  const handleConfirmDelete = async () => {
    if (!unitToDelete || !authToken) return;
    try {
      await deleteEnseignementUnit(unitToDelete.raw.Id, authToken);
      refreshUnits();
    } catch (err) {
      alert(`Erreur lors de la suppression : ${err.message}`);
    }
    setConfirmOpen(false);
    setUnitToDelete(null);
  };
  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setUnitToDelete(null);
  };

  // On remonte vers <Table /> les placeholders skeleton ou les vraies données
  return (
    <>
      <Table
        columns={columns}
        data={
          loading
            ? Array.from({ length: 3 }).map((_, i) => ({ skeleton: true, key: `skele-${i}` }))
            : units
        }
        toolbarContents={toolbarContents}
      />

      {modalOpen && (
        <EnseignementUnitModal
          isOpen={modalOpen}
          initialData={selectedUnit || {}}
          onClose={() => {
            setModalOpen(false);
            setSelectedUnit(null);
          }}
          onSave={() => {
            refreshUnits();
            setModalOpen(false);
            setSelectedUnit(null);
          }}
        />
      )}

      {confirmOpen && (
        <ConfirmCard
          message={
            <>
              Voulez-vous vraiment supprimer{' '}
              <strong>{unitToDelete?.raw.Initialism}</strong> ?
            </>
          }
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
}
