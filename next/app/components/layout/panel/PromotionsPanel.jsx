'use client';

import { useState, useEffect, useCallback } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@primer/octicons-react';

import { getCookie } from '@/app/services/cookies';
import getPromotions from '@/app/services/api/promotions/getPromotions';
import deletePromotion from '@/app/services/api/promotions/id/deletePromotion';

import Table from '@/app/components/layout/table/Table';
import Button from '@/app/components/ui/Button';
import PromotionModal from '@/app/components/layout/forms/modal/PromotionModal';
import ConfirmCard from '@/app/components/ui/ConfirmCard';

const columns = [
  { key: 'year',    title: 'Année',   sortable: true  },
  { key: 'diploma', title: 'Diplôme', sortable: true  },
  { key: 'level',   title: 'Niveau',  sortable: true  },
  { key: 'actions', title: 'Action(s)', sortable: false },
];

const mapPromotionToTableData = (promo) => ({
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
  const [authToken, setAuthToken]           = useState('');
  const [promotions, setPromotions]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion]   = useState(null);
  const [confirmOpen, setConfirmOpen]       = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);

  useEffect(() => {
    (async () => {
      const token = await getCookie('token');
      setAuthToken(token);
    })();
  }, []);

  const renderActions = useCallback((item) => [
    {
      icon: <PencilIcon size={16} />,
      onClick: () => {
        setSelectedPromotion({
          Id: item.raw.Id,
          createdAt: item.raw.CreatedAt,
          updatedAt: item.raw.UpdatedAt,
          Diploma: { Initialism: item.raw.Diploma?.Initialism || '' },
          PromotionLevel: { Initialism: item.raw.PromotionLevel?.Initialism || '' },
          Year: item.raw.Year,
        });
        setPromotionModalOpen(true);
      },
    },
    {
      icon: <TrashIcon size={16} />,
      onClick: () => {
        setPromotionToDelete(item);
        setConfirmOpen(true);
      },
    },
  ], []);

  const refreshPromotions = useCallback(() => {
    if (!authToken) return;
    setLoading(true);
    getPromotions(authToken)
      .then((data) => {
        const mapped = data.map(mapPromotionToTableData);
        const withActions = mapped.map(item => ({
          ...item,
          actions: renderActions(item),
        }));
        setPromotions(withActions);
      })
      .catch(err => alert(`Erreur de chargement : ${err.message}`))
      .finally(() => setLoading(false));
  }, [authToken, renderActions]);

  useEffect(() => {
    refreshPromotions();
  }, [refreshPromotions]);

  const toolbarContents = (
    <Button variant="default_sq" onClick={() => {
      setSelectedPromotion(null);
      setPromotionModalOpen(true);
    }}>
      <PlusIcon size={24} className="text-white" />
    </Button>
  );

  const handleConfirmDelete = async () => {
    if (!promotionToDelete || !authToken) return;
    try {
      await deletePromotion(promotionToDelete.raw.Id, authToken);
      refreshPromotions();
    } catch (err) {
      alert(`Erreur lors de la suppression : ${err.message}`);
    }
    setConfirmOpen(false);
    setPromotionToDelete(null);
  };
  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setPromotionToDelete(null);
  };

  return (
    <>
      <Table
        columns={columns}
        data={
          loading
            ? Array.from({ length: 3 }).map((_, i) => ({ skeleton: true, key: i }))
            : promotions
        }
        toolbarContents={toolbarContents}
      />

      {promotionModalOpen && (
        <PromotionModal
          isOpen={promotionModalOpen}
          initialData={selectedPromotion || {}}
          onClose={() => {
            setPromotionModalOpen(false);
            setSelectedPromotion(null);
          }}
          onSave={() => {
            refreshPromotions();
            setPromotionModalOpen(false);
            setSelectedPromotion(null);
          }}
        />
      )}

      {confirmOpen && (
        <ConfirmCard
          message={
            <span>
              Voulez-vous vraiment supprimer la promotion de{' '}
              <strong>{promotionToDelete?.raw.Diploma?.Initialism} {promotionToDelete?.raw.PromotionLevel?.Name} - {promotionToDelete?.raw.Year}</strong> ?
            </span>
          }
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
}
