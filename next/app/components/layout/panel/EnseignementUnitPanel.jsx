'use client';

import { PencilIcon, TrashIcon } from '@primer/octicons-react';
import CrudPanel from './CrudPanel';
import getUnits from '@/app/services/api/enseignementUnit/getEnseignementUnits';
import deleteUnit from '@/app/services/api/enseignementUnit/id/deleteEnseignementUnit';
import EnseignementUnitModal from '@/app/components/layout/forms/modal/EnseignementUnitModal';

const columns = [
  { key: 'initialism', title: 'Sigle', sortable: true },
  { key: 'name', title: 'Nom', sortable: true },
];

const mapUnitToRow = unit => ({
  raw: unit,
  initialism: unit.Initialism,
  name: unit.Name,
});

const actions = (row, helpers) => [
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
];

export default function UEPanel() {
  return (
    <CrudPanel
      columns={columns}
      fetchFn={getUnits}
      deleteFn={deleteUnit}
      mapToRow={mapUnitToRow}
      ModalComponent={EnseignementUnitModal}
      modalProps={{
        confirmMessage: unit => <>Voulez-vous supprimer <strong>{unit.Initialism}</strong> ?</>,
      }}
      actions={actions}
    />
  );
}
