// app/components/layout/panel/EnseignementUnitPanel.jsx
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
    />
  );
}
