'use client';

import { PencilIcon, TrashIcon, DuplicateIcon } from '@primer/octicons-react';
import CrudPanel from './CrudPanel';
import getTemplates from '@/app/services/api/templates/getTemplates';
import getTemplateMilestones from '@/app/services/api/templates/id/milestone/getTemplateMilestones';
import deleteTemplate from '@/app/services/api/templates/id/deleteTemplate';
import TemplateModal from '@/app/components/layout/forms/modal/TemplateModal';

const columns = [
  { key: 'year', title: 'Année', sortable: true },
  { key: 'ue', title: 'UE', sortable: true },
  { key: 'milestones', title: 'Nombre de jalons', sortable: true },
];

async function fetchTemplatesWithCount(token) {
  const templates = await getTemplates(token);
  return Promise.all(
    templates.map(async tpl => {
      const ms = await getTemplateMilestones(tpl.Id, token);
      return { ...tpl, milestoneCount: Array.isArray(ms) ? ms.length : 0 };
    })
  );
}

const mapTemplateToRow = tpl => ({
  raw: tpl,
  year: tpl.Year,
  ue: `${tpl.EnseignementUnit.Name} (${tpl.EnseignementUnit.Initialism})`,
  milestones: tpl.milestoneCount,
});

const actionsForRow = (row, helpers) => [
  {
    icon: <PencilIcon size={16} />,
    onClick: () => helpers.edit(row),
    variant: 'action_sq',
  },
  {
    icon: <TrashIcon size={16} />,
    onClick: () => helpers.del(row),
    variant: 'action_sq_warn',
  },
  {
    icon: <DuplicateIcon size={16} />,
    onClick: () => console.log('Duplicate template:', row.raw),
    variant: 'action_sq',
  },
];

export default function TemplatePanel() {
  return (
    <CrudPanel
      columns={columns}
      fetchFn={fetchTemplatesWithCount}
      deleteFn={deleteTemplate}
      mapToRow={mapTemplateToRow}
      ModalComponent={TemplateModal}
      modalProps={{
        confirmMessage: tpl => (
          <>Supprimer le template <strong>{`${tpl.EnseignementUnit.Name} (${tpl.EnseignementUnit.Initialism}) — ${tpl.Year}`}</strong> ?</>
        ),
      }}
      actionsForRow={actionsForRow}
    />
  );
}
