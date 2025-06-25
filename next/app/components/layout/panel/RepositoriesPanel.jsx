'use client';

import { useState } from 'react';
import { UploadIcon, GraphIcon, DashIcon, CheckIcon, PencilIcon, ArchiveIcon, DuplicateIcon, CommentIcon, FileZipIcon, MarkGithubIcon, BeakerIcon } from '@primer/octicons-react';

import Button from '@/app/components/ui/Button';
import CrudPanel from './CrudPanel';
import { NotificationCard } from '@/app/components/ui/NotificationCard';
import ConfirmCard from '@/app/components/ui/ConfirmCard';

import getRepositories from '@/app/services/api/repositories/getRepositories';
import archiveRepository from '@/app/services/api/repositories/id/archiveRepository';
import getUsersRepository from '@/app/services/api/repositories/id/getUsersRepository';

import RepositoryModal from '@/app/components/layout/forms/modal/RepositoryModal';
import ImportRepositoriesModal from '@/app/components/layout/forms/modal/importRepositoriesModal';
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

export default function RepositoriesPanel() {
  const [importOpen, setImportOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState(null);
  const [statsErrorMessage, setStatsErrorMessage] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toArchive, setToArchive] = useState(null);
  const [simulateMode, setSimulateMode] = useState(null);
  const [showSimulateOptions, setShowSimulateOptions] = useState(false);
  const notify = useNotification();
  
  const handleOpenStats = (repoId) => {
    setSelectedRepoId(repoId);
    setStatsModalOpen(true);
    setStatsErrorMessage(null);
  };

  const handleCloseStatsModal = () => {
    setStatsModalOpen(false);
    setSelectedRepoId(null);
  };

  const handleStatsError = (message) => {
    setStatsErrorMessage(message);
  };

  const clearStatsErrorMessage = () => {
    setStatsErrorMessage(null);
  };

  const SimulationOptions = () => {
    if (!showSimulateOptions) return null;
    
    return (
      <div className="absolute z-50 right-0 mt-2 bg-white shadow-lg rounded-md p-2 border border-gray-200 w-44">
        <p className="text-xs font-bold mb-2 text-gray-600 px-2">Mode de simulation:</p>
        {['complete', 'partial', 'minimal', 'empty', 'error', 'timeout'].map(mode => (
          <button
            key={mode}
            onClick={() => {
              setSimulateMode(mode);
              setShowSimulateOptions(false);
            }}
            className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${
              simulateMode === mode ? 'bg-blue-50 text-blue-700' : ''
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
        <hr className="my-1" />
        <button
          onClick={() => {
            setSimulateMode(null);
            setShowSimulateOptions(false);
          }}
          className="block w-full text-left px-2 py-1 text-sm text-red-600 rounded hover:bg-gray-100"
        >
          Désactiver
        </button>
      </div>
    );
  };

  const importBtn = (
    <Button key="import" variant="default_sq" onClick={() => setImportOpen(true)}>
      <UploadIcon size={24} className="text-white" />
    </Button>
  );

  const simulateBtn = (
    <div className="relative" key="simulate">
      <Button 
        variant={simulateMode ? "warn_sq" : "default_sq"} 
        onClick={() => setShowSimulateOptions(!showSimulateOptions)}
        title="Mode simulation de données partielles"
      >
        <BeakerIcon size={24} className="text-white" />
      </Button>
      {simulateMode && (
        <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white text-xs px-1 rounded-full">
          {simulateMode.substring(0, 1).toUpperCase()}
        </div>
      )}
      <SimulationOptions />
    </div>
  );

  const actions = (row, helpers) => [
    {
      icon: <PencilIcon size={16} />,
      onClick: () => helpers.edit(row),
      variant: row.raw.ArchivedAt ? 'action_sq_disabled' : 'action_sq',
      disabled: Boolean(row.raw.ArchivedAt),
    },
    {
      icon: <ArchiveIcon size={16} />,
      onClick: () => { setToArchive(row.raw); setConfirmOpen(true); },
      variant: 'action_sq_warn',
    },
    {
      icon: <DuplicateIcon size={16} />,
      onClick: () => console.log('Duplicate repo:', row.raw),
      variant: 'action_sq',
    },
    {
      icon: <CommentIcon size={16} />,
      onClick: () => console.log('Comment repo:', row.raw),
      variant: 'action_sq',
    },
    {
      icon: <FileZipIcon size={16} />,
      onClick: () => window.open(`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_ORGANIZATION_NAME}/${row.raw.Id}/archive/HEAD.zip`, '_blank'),
      variant: 'action_sq',
    },
    {
      icon: <MarkGithubIcon size={16} />,
      onClick: () => window.open(`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_ORGANIZATION_NAME}/${row.raw.Id}`, '_blank'),
      variant: 'action_sq',
    },
    {
      icon: <GraphIcon size={16} />,
      onClick: () => handleOpenStats(row.raw.Id),
      variant: 'action_sq',
    },
  ];

  return (
    <>
      <NotificationCard 
        message={statsErrorMessage}
        type="warn"
        onClear={clearStatsErrorMessage}
      />
      
      <CrudPanel
        key={refreshKey}
        columns={columns}
        fetchFn={fetchRepositoriesWithStudents}
        mapToRow={mapRepositoryToRow}
        ModalComponent={RepositoryModal}
        modalProps={{
          confirmMessage: (repo) => (
            <>Voulez-vous vraiment supprimer le dépôt <strong>{`${repo.Template?.EnseignementUnit?.Initialism} ${repo.Template?.Year}`}</strong>&nbsp;?</>
          ),
        }}
        toolbarButtons={[importBtn, simulateBtn]}
        actions={actions}
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
          message={
            toArchive.ArchivedAt == null
              ? <>Voulez-vous <strong>archiver</strong> le dépôt <strong>{`${toArchive.Template?.EnseignementUnit?.Initialism} ${toArchive.Template?.Year}`}</strong>&nbsp;?</>
              : <>Voulez-vous <strong>désarchiver</strong> le dépôt <strong>{`${toArchive.Template?.EnseignementUnit?.Initialism} ${toArchive.Template?.Year}`}</strong>&nbsp;?</>
          }
          onConfirm={async () => {
            try {
              const token = await getCookie('token');
              const shouldArchive = toArchive.ArchivedAt == null;
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
          onError={handleStatsError}
          options={{ simulateMode }}
        />
      )}
    </>
  );
}
