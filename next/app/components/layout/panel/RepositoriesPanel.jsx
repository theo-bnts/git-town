'use client';

import { useState } from 'react';
import {
  UploadIcon,
  GraphIcon,
  DashIcon,
  CheckIcon,
  PencilIcon,
  ArchiveIcon,
  DuplicateIcon,
  CommentIcon,
  FileZipIcon,
  MarkGithubIcon,
} from '@primer/octicons-react';

import Button from '@/app/components/ui/Button';
import CrudPanel from './CrudPanel';
import { NotificationCard } from '@/app/components/ui/NotificationCard';
import ConfirmCard from '@/app/components/ui/ConfirmCard';

import getRepositories from '@/app/services/api/repositories/getRepositories';
import getUserRepositories from '@/app/services/api/users/id/repositories/getUserRepositories';
import archiveRepository from '@/app/services/api/repositories/id/archiveRepository';
import getUsersRepository from '@/app/services/api/repositories/id/getUsersRepository';

import RepositoryModal from '@/app/components/layout/forms/modal/RepositoryModal';
import ImportRepositoriesModal from '@/app/components/layout/forms/modal/importRepositoriesModal';
import CommentModal from '@/app/components/layout/forms/modal/CommentModal';
import RepositoryStatsModal from '@/app/components/ui/modal/statistics/RepositoryStatsModal';

import { getCookie } from '@/app/services/cookies';
import { useNotification } from '@/app/context/NotificationContext';

const columns = [
  { key: 'students', title: 'Étudiants', sortable: true },
  { key: 'tutor', title: 'Tuteur', sortable: true },
  { key: 'ue', title: 'UE', sortable: true },
  { key: 'year', title: 'Année', sortable: true },
  { key: 'diploma', title: 'Nom diplôme', sortable: true },
  { key: 'level', title: 'Niveau', sortable: true },
  { key: 'archived', title: 'Archivé', sortable: false },
];

async function fetchRepositoriesWithStudents(token) {
  const repos = await getRepositories(token);
  return Promise.all(
    repos.map(async (repo) => {
      const users = await getUsersRepository(repo.Id, token);
      return {
        ...repo,
        studentNames: Array.isArray(users)
          ? users.map((u) => u.FullName).sort()
          : [],
      };
    })
  );
}

async function fetchUserRepositoriesWithStudents(userId, token) {
  const repos = await getUserRepositories(userId, token);
  return Promise.all(
    repos.map(async (repo) => {
      const users = await getUsersRepository(repo.Id, token);
      return {
        ...repo,
        studentNames: Array.isArray(users)
          ? users.map((u) => u.FullName).sort()
          : [],
      };
    })
  );
}

const mapRepositoryToRow = (repo) => ({
  raw: repo,
  students: repo.studentNames,
  tutor: repo.User?.FullName || '',
  ue: `${repo.Template.EnseignementUnit.Name} (${repo.Template.EnseignementUnit.Initialism})`,
  year: repo.Template.Year,
  diploma: repo.Promotion?.Diploma
    ? `${repo.Promotion.Diploma.Name} (${repo.Promotion.Diploma.Initialism})`
    : '',
  level: repo.Promotion?.PromotionLevel
    ? `${repo.Promotion.PromotionLevel.Name} (${repo.Promotion.PromotionLevel.Initialism})`
    : '',
  archived: repo.ArchivedAt
    ? <CheckIcon key={`check-${repo.Id}`} size={16} className="text-[var(--accent-color)]" />
    : <DashIcon key={`dash-${repo.Id}`} size={16} />,
});

export default function RepositoriesPanel({ role, userId }) {
  const [importOpen, setImportOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState(null);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentRepoId, setCommentRepoId] = useState(null);
  const [statsErrorMessage, setStatsErrorMessage] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toArchive, setToArchive] = useState(null);
  const notify = useNotification();

  const fetchFn = async (token) => {
    if (role === 'student') {
      if (!userId) return [];
      return fetchUserRepositoriesWithStudents(userId, token);
    }
    return fetchRepositoriesWithStudents(token);
  };

  const handleOpenStats = (repoId) => {
    setSelectedRepoId(repoId);
    setStatsModalOpen(true);
    setStatsErrorMessage(null);
  };

  const handleCloseStatsModal = () => {
    setStatsModalOpen(false);
    setSelectedRepoId(null);
  };

  const clearStatsErrorMessage = () => {
    setStatsErrorMessage(null);
  };

  const toolbarButtons = [];
  if (role === 'administrator') {
    toolbarButtons.push(
      <Button key="import" variant="default_sq" onClick={() => setImportOpen(true)}>
        <UploadIcon size={24} className="text-white" />
      </Button>
    );
  }

  const actions = (row, helpers) => {
    const baseActions = [
      { icon: <GraphIcon size={16} />, onClick: () => handleOpenStats(row.raw.Id), variant: 'action_sq' },
      { icon: <MarkGithubIcon size={16} />, onClick: () => window.open(
          `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_ORGANIZATION_NAME}/${row.raw.Id}`,
          '_blank'
        ), variant: 'action_sq' },
    ];

    if (role === 'student') {
      return baseActions;
    }

    if (role === 'teacher') {
      return [
        ...baseActions,
        { icon: <CommentIcon size={16} />, onClick: () => { setCommentRepoId(row.raw.Id); setCommentOpen(true); }, variant: 'action_sq' },
      ];
    }

    return [
      { icon: <PencilIcon size={16} />, onClick: () => helpers.edit(row), variant: row.raw.ArchivedAt ? 'action_sq_disabled' : 'action_sq', disabled: Boolean(row.raw.ArchivedAt) },
      { icon: <ArchiveIcon size={16} />, onClick: () => { setToArchive(row.raw); setConfirmOpen(true); }, variant: 'action_sq_warn' },
      { icon: <DuplicateIcon size={16} />, onClick: () => console.log('Duplicate repo:', row.raw), variant: 'action_sq' },
      { icon: <CommentIcon size={16} />, onClick: () => { setCommentRepoId(row.raw.Id); setCommentOpen(true); }, variant: 'action_sq' },
      { icon: <FileZipIcon size={16} />, onClick: () => window.open(
          `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_ORGANIZATION_NAME}/${row.raw.Id}/archive/HEAD.zip`,
          '_blank'
        ), variant: 'action_sq' },
      ...baseActions,
    ];
  };

  return (
    <>
      <NotificationCard message={statsErrorMessage} type="warn" onClear={clearStatsErrorMessage} />
      <CrudPanel
        key={refreshKey}
        columns={columns}
        fetchFn={fetchFn}
        mapToRow={mapRepositoryToRow}
        ModalComponent={RepositoryModal}
        modalProps={{ confirmMessage: (repo) => (
          <>Voulez-vous vraiment supprimer le dépôt <strong>{`${repo.Template?.EnseignementUnit?.Initialism} ${repo.Template?.Year}`}</strong> ?</>
        ) }}
        toolbarButtons={toolbarButtons}
        actions={actions}
        disableAdd={role !== 'administrator'}
      />

      {importOpen && (
        <ImportRepositoriesModal
          isOpen={importOpen}
          onClose={() => setImportOpen(false)}
          onImport={() => { setImportOpen(false); setRefreshKey((k) => k + 1); }}
        />
      )}

      {confirmOpen && toArchive && (
        <ConfirmCard
          message={toArchive.ArchivedAt == null ?
            <>Voulez-vous <strong>archiver</strong> le dépôt <strong>{`${toArchive.Template?.EnseignementUnit?.Initialism} ${toArchive.Template?.Year}`}</strong> ?</> :
            <>Voulez-vous <strong>désarchiver</strong> le dépôt <strong>{`${toArchive.Template?.EnseignementUnit?.Initialism} ${toArchive.Template?.Year}`}</strong> ?</>
          }
          onConfirm={async () => {
            const token = await getCookie('token');
            const shouldArchive = toArchive.ArchivedAt == null;
            try {
              await archiveRepository(toArchive.Id, shouldArchive, token);
              notify(`Dépôt ${shouldArchive ? 'archivé' : 'désarchivé'} avec succès.`, 'success');
              setRefreshKey((k) => k + 1);
            } catch {
              notify('Erreur lors de la mise à jour du dépôt.', 'error');
            } finally {
              setConfirmOpen(false);
            }
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}

      {statsModalOpen && selectedRepoId && (
        <RepositoryStatsModal
          isOpen={statsModalOpen}
          onClose={handleCloseStatsModal}
          repositoryId={selectedRepoId}
          onError={setStatsErrorMessage}
        />
      )}

      {commentOpen && commentRepoId && (
        <CommentModal isOpen={commentOpen} repositoryId={commentRepoId} onClose={() => setCommentOpen(false)} onSave={() => setRefreshKey((k) => k + 1)} />
      )}
    </>
  );
}

