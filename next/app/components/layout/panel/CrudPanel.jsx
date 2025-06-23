'use client';

import React, { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@primer/octicons-react';

import Table from '@/app/components/layout/table/Table';
import ConfirmCard from '@/app/components/ui/ConfirmCard';
import Button from '@/app/components/ui/Button';
import useCrudData from '@/app/hooks/useCrudData';

export default function CrudPanel({
  columns,
  fetchFn,
  deleteFn,
  mapToRow,
  ModalComponent,
  modalProps = {},
  toolbarButtons = [],
  customActions,
}) {
  const { data, loading, refresh, remove } = useCrudData({ fetchFn, deleteFn, mapToRow });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const actionsFactory = (row) => {
    const defaultActions = [
      {
        icon: <PencilIcon size={16} />,
        onClick: () => {
          setSelectedItem(row.raw);
          setIsModalOpen(true);
        },
      },
      {
        icon: <TrashIcon size={16} />,
        onClick: () => {
          setItemToDelete(row.raw);
          setIsConfirmOpen(true);
        },
      },
    ];
    
    // Ajouter les actions personnalisées si elles existent
    const additionalActions = customActions ? customActions(row) : [];
    
    return [...defaultActions, ...additionalActions];
  };

  return (
    <>
      <Table
        columns={[...columns, { key: 'actions', title: 'Actions', sortable: false }]}
        data={
          loading
            ? Array.from({ length: 3 }).map((_, i) => ({ skeleton: true, key: `skele-${i}` }))
            : data.map(row => ({ ...row, actions: actionsFactory(row) }))
        }
        toolbarContents={
          <>
            <Button variant="default_sq" onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}>
              <PlusIcon size={24} className="text-white" />
            </Button>
            {toolbarButtons}
          </>
        }
      />

      {isModalOpen && (
        <ModalComponent
          isOpen={isModalOpen}
          initialData={selectedItem || {}}
          onClose={() => setIsModalOpen(false)}
          onSave={() => { refresh(); setIsModalOpen(false); }}
          {...modalProps}
        />
      )}

      {isConfirmOpen && (
        <ConfirmCard
          message={modalProps.confirmMessage(itemToDelete)}
          onConfirm={async () => {
            await remove(itemToDelete.Id);
            setIsConfirmOpen(false);
          }}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </>
  );
}
