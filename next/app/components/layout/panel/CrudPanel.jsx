'use client';

import { useState } from 'react';
import { PlusIcon } from '@primer/octicons-react';

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
  actions = () => [],
  toolbarButtons = [],
}) {
  const { data, loading, refresh, remove } = useCrudData({ fetchFn, deleteFn, mapToRow });

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const helpers = {
    edit: (row) => { setSelected(row.raw); setModalOpen(true); },
    del: (row) => { setToDelete(row.raw); setConfirmOpen(true); },
    refresh,
    remove: async (id) => { await remove(id); },
  };

  const rows = loading
    ? Array.from({ length: 3 }).map((_, i) => ({ skeleton: true, key: i }))
    : data.map((r) => ({ ...r, actions: actions(r, helpers) }));

  return (
    <>
      <Table
        columns={[...columns, { key: 'actions', title: 'Actions', sortable: false }]}
        data={rows}
        toolbarContents={
          <>
            <Button variant="default_sq" onClick={() => { setSelected(null); setModalOpen(true); }}>
              <PlusIcon size={24} className="text-white" />
            </Button>
            {toolbarButtons}
          </>
        }
      />
      {modalOpen && (
        <ModalComponent
          isOpen={modalOpen}
          initialData={selected || {}}
          onClose={() => { refresh(); setModalOpen(false); }}
          onSave={() => { refresh(); setModalOpen(false); }}
          {...modalProps}
        />
      )}
      {confirmOpen && (
        <ConfirmCard
          message={modalProps.confirmMessage(toDelete)}
          onConfirm={async () => { await helpers.remove(toDelete.Id); setConfirmOpen(false); }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </>
  );
}
