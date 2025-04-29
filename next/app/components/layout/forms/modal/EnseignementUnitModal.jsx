'use client';

import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@primer/octicons-react';

import { getCookie } from '@/app/services/cookies';
import getEnseignementUnits from '@/app/services/api/enseignementUnit/getEnseignementUnits';
import deleteEnseignementUnit from '@/app/services/api/enseignementUnit/id/deleteEnseignementUnit';

import Table from '@/app/components/layout/table/Table';
import Button from '@/app/components/ui/Button';
import ConfirmCard from '@/app/components/ui/ConfirmCard';
import EnseignementUnitModal from '@/app/components/layout/forms/modal/EnseignementUnitModal';
import useFetchWithSkeleton from '@/app/hooks/useFetchWithSkeleton';
import TableSkeleton from '@/app/components/layout/table/TableSkeleton';

const columns = [
  { key: 'initialism', title: 'Sigle', sortable: true },
  { key: 'name', title: 'Nom', sortable: true },
  { key: 'actions', title: 'Action(s)', sortable: false },
];

const mapUnitToRow = (unit) => ({
  raw: unit,
  initialism: unit.Initialism,
  name: unit.Name,
});

export default function EnseignementUnitPanel() {
  const [authToken, setAuthToken] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);

  // 1️⃣ Récupération du token
  useEffect(() => {
    (async () => {
      const token = await getCookie('token');
      setAuthToken(token);
    })();
  }, []);

  // 2️⃣ Fetch uniquement si authToken est prêt
  const { data, loading, error, refetch } = useFetchWithSkeleton(
    authToken ? () => getEnseignementUnits(authToken) : null
  );

  const rawUnits = data || [];

  // 3️⃣ Déclarez renderActions avant son usage
  const renderActions = (row) => [
    {
      icon: <PencilIcon size={16} />,
      onClick: () => {
        setSelectedUnit({
          Id: row.raw.Id,
          Initialism: row.raw.Initialism,
          Name: row.raw.Name,
          createdAt: row.raw.CreatedAt,
          updatedAt: row.raw.UpdatedAt,
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

  const units = rawUnits
    .map(mapUnitToRow)
    .map((row) => ({ ...row, actions: renderActions(row) }));

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

  const handleConfirmDelete = async () => {
    if (!unitToDelete || !authToken) return;
    try {
      await deleteEnseignementUnit(unitToDelete.raw.Id, authToken);
      refetch();
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

  return (
    <>
      {loading ? (
        <TableSkeleton cols={columns.length} />
      ) : error ? (
        <p className="text-red-600">Erreur de chargement : {error}</p>
      ) : (
        <Table
          columns={columns}
          data={units}
          toolbarContents={toolbarContents}
        />
      )}

      {modalOpen && (
        <EnseignementUnitModal
          isOpen={modalOpen}
          initialData={selectedUnit || {}}
          onClose={() => {
            setModalOpen(false);
            setSelectedUnit(null);
          }}
          onSave={() => {
            refetch();
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
