'use client';

import React from 'react';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { textStyles } from "@/app/styles/tailwindStyles";

export default function ErrorView({ error, onClose, onRetry }) {
  return (
    <Card variant="error" className="p-4 mx-auto max-w-md">
      <div className="text-center">
        <h3 className="text-lg font-bold text-red-700 mb-2">Erreur de chargement</h3>
        <p className="text-gray-700 mb-4">
          {error.message || "Impossible de charger les statistiques"}
        </p>
        <div className="flex justify-center space-x-3">
          <Button variant="warn" onClick={onClose}>
            <span className={textStyles.defaultWhite}>Fermer</span>
          </Button>
          <Button variant="default" onClick={onRetry}>
            <span className={textStyles.defaultWhite}>Réessayer</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}