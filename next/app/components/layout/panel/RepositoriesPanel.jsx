'use client';

import { useState } from 'react';
import { UploadIcon, GraphIcon } from '@primer/octicons-react';
import Button from '@/app/components/ui/Button';
import CrudPanel from './CrudPanel';
import { NotificationCard } from '@/app/components/ui/modal/NotificationCard';

import getRepositories from '@/app/services/api/repositories/getRepositories';
import deleteRepository from '@/app/services/api/repositories/id/deleteRepository';
import getUsersRepository from '@/app/services/api/repositories/id/getUsersRepository';

import RepositoryModal from '@/app/components/layout/forms/modal/RepositoryModal';
import ImportRepositoriesModal from '@/app/components/layout/forms/modal/importRepositoriesModal';
import RepositoryStatsModal from '@/app/components/ui/modal/statistics/RepositoryStatsModal';

const columns = [
  { key: 'students', title: 'Étudiants', sortable: true },
  { key: 'tutor', title: 'Tuteur', sortable: true },
  { key: 'ue', title: 'UE', sortable: true },
  { key: 'year', title: 'Année', sortable: true },
  { key: 'diploma', title: 'Nom diplôme', sortable: true },
  { key: 'level', title: 'Niveau', sortable: true },
];

async function fetchRepositoriesWithStudents(token) {
  const repositories = await getRepositories(token);
  return Promise.all(
    repositories.map(async repo => {
      const students = await getUsersRepository(repo.Id, token);
      const studentNames = Array.isArray(students)
        ? students.map(s => s.FullName).sort()
        : [];
      return { ...repo, studentNames };
    }),
  );
}

const mapRepositoryToRow = repo => ({
  raw: repo,
  students: repo.studentNames,
  tutor: repo.User?.FullName || 'N/A',
  ue: `${repo.Template.EnseignementUnit.Name} (${repo.Template.EnseignementUnit.Initialism})`,
  year: repo.Template.Year,
  diploma: repo.Promotion?.Diploma
    ? `${repo.Promotion.Diploma.Name} (${repo.Promotion.Diploma.Initialism})`
    : '',
  level: repo.Promotion?.PromotionLevel
    ? `${repo.Promotion.PromotionLevel.Name} (${repo.Promotion.PromotionLevel.Initialism})`
    : '',
});

export default function RepositoriesPanel() {
  const [importOpen, setImportOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState(null);
  const [statsErrorMessage, setStatsErrorMessage] = useState(null);

  const handleImport = () => {
    setImportOpen(false);
    setRefreshKey(k => k + 1);
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

  const handleStatsError = (message) => {
    setStatsErrorMessage(message);
  };

  const clearStatsErrorMessage = () => {
    setStatsErrorMessage(null);
  };

  const importButton = (
    <Button
      key="import"
      variant="default_sq"
      onClick={() => setImportOpen(true)}
    >
      <UploadIcon size={24} className="text-white" />
    </Button>
  );
  
  const customActions = (row) => [{
    icon: <GraphIcon size={16} />,
    onClick: () => handleOpenStats(row.raw.Id),
    title: 'Voir les statistiques'
  }];

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
        deleteFn={deleteRepository}
        mapToRow={mapRepositoryToRow}
        ModalComponent={RepositoryModal}
        customActions={customActions}
        modalProps={{
          confirmMessage: repo => (
            <>Voulez-vous vraiment supprimer le dépôt&nbsp;
              <strong>{`${repo.Template?.EnseignementUnit?.Initialism} ${repo.Template?.Year}`}</strong>&nbsp;?
            </>
          ),
        }}
        toolbarButtons={[importButton]}
      />

      {importOpen && (
        <ImportRepositoriesModal
          isOpen={importOpen}
          onClose={() => setImportOpen(false)}
          onImport={handleImport}
        />
      )}
      
      {statsModalOpen && selectedRepoId && (
        <RepositoryStatsModal
          isOpen={statsModalOpen}
          onClose={handleCloseStatsModal}
          repositoryId={selectedRepoId}
          onError={handleStatsError}
        />
      )}
    </>
  );
}
