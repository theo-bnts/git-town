'use client';
import { useState } from 'react';
import { UploadIcon, DashIcon, CheckIcon } from '@primer/octicons-react';
import Button from '@/app/components/ui/Button';
import CrudPanel from './CrudPanel';
import ConfirmCard from '@/app/components/ui/ConfirmCard';
import getRepositories from '@/app/services/api/repositories/getRepositories';
import archiveRepository from '@/app/services/api/repositories/id/archiveRepository';
import getUsersRepository from '@/app/services/api/repositories/id/getUsersRepository';
import RepositoryModal from '@/app/components/layout/forms/modal/RepositoryModal';
import ImportRepositoriesModal from '@/app/components/layout/forms/modal/importRepositoriesModal';
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
  tutor: repo.User?.FullName || 'N/A',
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toArchive, setToArchive] = useState(null);
  const notify = useNotification();
  const ORG = process.env.NEXT_PUBLIC_GITHUB_ORGANISATION_NAME;

  const importBtn = (
    <Button key="import" variant="default_sq" onClick={() => setImportOpen(true)}>
      <UploadIcon size={24} className="text-white" />
    </Button>
  );

  return (
    <>
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
        toolbarButtons={[importBtn]}
        actionTypes={['edit', 'archive', 'duplicate', 'comment', 'github']}
        actionHandlers={{
          github: (row) => window.open(`https://github.com/${ORG}/${row.raw.Id}`, '_blank'),
          archive: (row) => { setToArchive(row.raw); setConfirmOpen(true); },
          duplicate: (row) => console.log('Duplicate repo:', row.raw),
          comment: (row) => console.log('Comment repo:', row.raw),
        }}
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
    </>
  );
}
