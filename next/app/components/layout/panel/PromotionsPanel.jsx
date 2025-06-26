'use client';

import { PencilIcon, TrashIcon, DuplicateIcon } from '@primer/octicons-react';
import CrudPanel from './CrudPanel';
import getPromotions from '@/app/services/api/promotions/getPromotions';
import deletePromotion from '@/app/services/api/promotions/id/deletePromotion';
import PromotionModal from '@/app/components/layout/forms/modal/PromotionModal';

const columns = [
  { key: 'year', title: 'Année', sortable: true },
  { key: 'diploma', title: 'Diplôme', sortable: true },
  { key: 'level', title: 'Niveau', sortable: true },
];

const mapPromotionToRow = promo => ({
  raw: promo,
  year: promo.Year,
  diploma: promo.Diploma
    ? `${promo.Diploma.Name} (${promo.Diploma.Initialism})`
    : '',
  level: promo.PromotionLevel
    ? `${promo.PromotionLevel.Name} (${promo.PromotionLevel.Initialism})`
    : '',
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
  {
    icon: <DuplicateIcon size={16} />,
    onClick: () => helpers.duplicate(row),
    variant: 'action_sq',
  },
];

export default function PromotionsPanel() {
  return (
    <CrudPanel
      columns={columns}
      fetchFn={getPromotions}
      deleteFn={deletePromotion}
      mapToRow={mapPromotionToRow}
      ModalComponent={PromotionModal}
      modalProps={{
        confirmMessage: promo => (
          <>Voulez-vous vraiment supprimer la promotion <strong>{promo.Diploma?.Initialism} {promo.PromotionLevel?.Name} </strong> 
            de <strong> {promo.Year}</strong> ?
          </>
        ),
      }}
      actions={actions}
    />
  );
}
