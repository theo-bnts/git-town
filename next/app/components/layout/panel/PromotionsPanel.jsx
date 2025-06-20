'use client';

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
          <>Voulez-vous vraiment supprimer la promotion de <strong>{promo.Diploma?.Initialism} {promo.PromotionLevel?.Name} – {promo.Year}</strong> ?</>
        ),
      }}
      actionTypes={['edit', 'delete', 'duplicate']}
      actionHandlers={{
        duplicate: row => console.log('Duplicate promotion:', row.raw),
      }}
    />
  );
}
