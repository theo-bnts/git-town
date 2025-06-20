// app/components/layout/crud/CrudPanel.jsx
'use client';

import React, { useState } from 'react';
import {
  PencilIcon,
  TrashIcon,
  DuplicateIcon,
  MarkGithubIcon,
  ArchiveIcon,
  CommentIcon,
  PlusIcon,
} from '@primer/octicons-react';

import Table from '@/app/components/layout/table/Table';
import ConfirmCard from '@/app/components/ui/ConfirmCard';
import Button from '@/app/components/ui/Button';
import useCrudData from '@/app/hooks/useCrudData';
import { useNotification } from '@/app/context/NotificationContext';

const ACTION_REGISTRY = {
  edit: {
    icon: <PencilIcon size={16} />,
    handler: (row, { edit }) => edit(row),
    variant: 'action_sq',
  },
  delete: {
    icon: <TrashIcon size={16} />,
    handler: (row, { del }) => del(row),
    variant: 'action_sq_warn',
  },
  duplicate: {
    icon: <DuplicateIcon size={16} />,
    handler: (row) => {
      console.warn('Duplicate not implemented for', row);
    },
    variant: 'action_sq',
  },
  github: {
    icon: <MarkGithubIcon size={16} />,
    handler: async (row) => {
      const gitId = row.raw.GitHubId || row.raw.Id;
      const res = await fetch(`https://api.github.com/user/${gitId}`);
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      const data = await res.json();
      window.open(data.html_url, '_blank');
    },
    variant: 'action_sq',
  },
  archive: {
    icon: <ArchiveIcon size={16} />,
    handler: (row) => {
      console.warn('Archive not implemented for', row);
    },
    variant: 'action_sq_warn',
  },
  comment: {
    icon: <CommentIcon size={16} />,
    handler: (row) => {
      console.warn('Comment not implemented for', row);
    },
    variant: 'action_sq',
  },
};

export default function CrudPanel({
  columns,
  fetchFn,
  deleteFn,
  mapToRow,
  ModalComponent,
  modalProps = {},
  actionTypes = [],
  actionHandlers = {},
  toolbarButtons = [],
}) {
  const { data, loading, refresh, remove } = useCrudData({ fetchFn, deleteFn, mapToRow });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const notify = useNotification();

  const helpers = {
    edit: row => { setSelectedItem(row.raw); setIsModalOpen(true); },
    del: row => { setItemToDelete(row.raw); setIsConfirmOpen(true); },
    refresh,
    remove: async id => { await remove(id); },
  };

  const buildActions = row => {
    const types = typeof actionTypes === 'function' ? actionTypes(row) : actionTypes;
    return types
      .map(type => {
        const regist = ACTION_REGISTRY[type];
        if (!regist) return null;
        const { icon, handler: defaultHandler, variant } = regist;
        const handler = actionHandlers[type]
          ? () => actionHandlers[type](row, helpers)
          : () => defaultHandler(row, helpers);
        return { icon, onClick: handler, variant };
      })
      .filter(Boolean);
  };

  const rows = loading
    ? Array.from({ length: 3 }).map((_, i) => ({ skeleton: true, key: `skele-${i}` }))
    : data.map(r => ({ ...r, actions: buildActions(r) }));

  return (
    <>
      <Table
        columns={[...columns, { key: 'actions', title: 'Actions', sortable: false }]}
        data={rows}
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
          onClose={() => { refresh(); setIsModalOpen(false); }}
          onSave={() => { refresh(); setIsModalOpen(false); }}
          {...modalProps}
        />
      )}

      {isConfirmOpen && (
        <ConfirmCard
          message={modalProps.confirmMessage(itemToDelete)}
          onConfirm={async () => { await helpers.remove(itemToDelete.Id); setIsConfirmOpen(false); }}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </>
  );
}
