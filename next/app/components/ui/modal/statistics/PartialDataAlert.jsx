'use client';

import React, { useState } from 'react';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Spinner from '@/app/components/ui/Spinner';
import { AlertIcon, SyncIcon } from '@primer/octicons-react';
import { textStyles, cardStyles, buttonStyles } from '@/app/styles/tailwindStyles';

/**
 * Alerte affichée lorsque certaines données statistiques sont manquantes
 */
export default function PartialDataAlert({ onRetry, missingFields = [], canRefresh = true, autoRetrying = false }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRetry = () => {
    setIsRefreshing(true);
    onRetry();
    
    // Simuler l'animation pendant un court moment même si la réponse est rapide
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  return (
    <div className="sticky top-0 z-10">
      <Card variant="partialData">
        <div className="flex items-start gap-3">
          <div className="text-[var(--accent-color)] mt-1 flex-shrink-0">
            <AlertIcon size={20} />
          </div>
          
          <div className="flex-grow">
            <h3 className={textStyles.alertTitle}>
              Données partiellement chargées
            </h3>
            
            <p className={textStyles.alertText + " mt-1"}>
              {autoRetrying 
                ? "Récupération automatique des données manquantes en cours..." 
                : "Certaines statistiques sont en cours de calcul par GitHub. Vous pouvez rafraîchir pour tenter de récupérer les données manquantes."}
            </p>
            
            {missingFields.length > 0 && (
              <div className="mt-2">
                <details>
                  <summary className={textStyles.alertLink}>
                    Voir les éléments manquants
                  </summary>
                  <ul className="mt-1 pl-5 list-disc text-sm text-[var(--hint-color)]">
                    {missingFields.slice(0, 5).map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                    {missingFields.length > 5 && <li>...</li>}
                  </ul>
                </details>
              </div>
            )}
          </div>
          
          {canRefresh && !autoRetrying && (
            <Button 
              variant="action_icon"
              onClick={handleRetry}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Spinner 
                  size="sm" 
                  thickness="2"
                  baseColor="var(--primary-color-hover)" 
                />
              ) : (
                <SyncIcon size={18} />
              )}
            </Button>
          )}
          
          {autoRetrying && (
            <div className="flex-shrink-0">
              <Spinner 
                size="sm" 
                thickness="2"
                baseColor="var(--primary-color-hover)" 
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
