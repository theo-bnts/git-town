'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Spinner from '@/app/components/ui/Spinner';
import { XIcon } from '@primer/octicons-react';
import PropTypes from 'prop-types';
import { textStyles } from '@/app/styles/tailwindStyles';

const TIMEOUT_THRESHOLD = 10; // Réduit de 30 à 10 secondes
const FIRST_WARNING_THRESHOLD = 5; // Réduit de 15 à 5 secondes  
const SECOND_WARNING_THRESHOLD = 8; // Réduit de 22 à 8 secondes

const ERROR_MESSAGES = {
  GATEWAY_TIMEOUT: "Le serveur a mis trop de temps à répondre. Le dépôt est peut-être trop volumineux ou vide.",
  LOADING_FAILED: "Le chargement des statistiques a échoué. Le dépôt est peut-être vide ou l'API GitHub n'est pas disponible."
};

export default function LoadingCard({ onClose, onTimeout, error, hasPartialData = false, autoRetrying = false }) {
  const [loadingTime, setLoadingTime] = useState(0);
  
  useEffect(() => {
    if (error && (error.code === "GATEWAY_TIMEOUT" || error.message?.includes('504'))) {
      onTimeout?.(ERROR_MESSAGES.GATEWAY_TIMEOUT);
      
      const closeTimer = setTimeout(() => {
        onClose?.();
      }, 500);
      
      return () => clearTimeout(closeTimer);
    }
  }, [error, onTimeout, onClose]);
  
  // Initialiser le timer de timeout pour afficher un message d'erreur
  // si les données ne sont pas reçues rapidement
  useEffect(() => {
    // Ne pas initialiser le timer si nous avons déjà des données ou si une tentative auto est en cours
    if (hasPartialData || autoRetrying) {
      return;
    }
    
    const timer = setInterval(() => {
      setLoadingTime(prev => {
        const newTime = prev + 1;
        if (newTime >= TIMEOUT_THRESHOLD) {
          clearInterval(timer);
          
          // Si on n'a toujours pas de données après le timeout,
          // afficher un message d'erreur et fermer le modal
          setTimeout(() => {
            onTimeout?.(ERROR_MESSAGES.LOADING_FAILED);
            onClose?.();
          }, 500);
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [onTimeout, onClose, hasPartialData, autoRetrying]);
  
  const renderWarningMessage = () => {
    if (loadingTime <= FIRST_WARNING_THRESHOLD) return null;
    
    return (
      <p className={textStyles.warning}>
        Le chargement prend plus de temps que prévu...
        {loadingTime > SECOND_WARNING_THRESHOLD && " Le dépôt est peut-être vide ou contient peu de commits."}
      </p>
    );
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <Card variant="default" className="p-6">
        {onClose && (
          <div className="absolute top-4 right-4">
            <Button variant="action_icon_warn" onClick={onClose}>
              <XIcon size={24} />
            </Button>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center p-8">
          <Spinner 
            size="lg" 
            thickness="4"
            className="mb-4"
          />
          
          <h3 className={`text-lg font-medium ${textStyles.default}`}>
            {autoRetrying ? 'Amélioration des données...' : 'Chargement des statistiques...'}
          </h3>
          <p className={textStyles.subtle}>
            {autoRetrying 
              ? 'Récupération de données supplémentaires en cours. L\'affichage sera automatiquement mis à jour.' 
              : 'Veuillez patienter pendant la récupération des données.'}
          </p>
          
          {!autoRetrying && renderWarningMessage()}
        </div>
      </Card>
    </div>
  );
}

LoadingCard.propTypes = {
  onClose: PropTypes.func,
  onTimeout: PropTypes.func,
  error: PropTypes.object,
  hasPartialData: PropTypes.bool,
  autoRetrying: PropTypes.bool
};
