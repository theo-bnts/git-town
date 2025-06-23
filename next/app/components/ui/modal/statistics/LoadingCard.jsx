'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { XIcon } from '@primer/octicons-react';
import PropTypes from 'prop-types';
import { textStyles } from '@/app/styles/tailwindStyles';

const TIMEOUT_THRESHOLD = 30;
const FIRST_WARNING_THRESHOLD = 15;
const SECOND_WARNING_THRESHOLD = 22;

const ERROR_MESSAGES = {
  GATEWAY_TIMEOUT: "Le serveur a mis trop de temps à répondre. Le dépôt est peut-être trop volumineux ou vide.",
  LOADING_FAILED: "Le chargement des statistiques a échoué. Le dépôt est peut-être vide ou l'API GitHub n'est pas disponible."
};

export default function LoadingCard({ onClose, onTimeout, error }) {
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
  
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingTime(prev => {
        const newTime = prev + 1;
        if (newTime >= TIMEOUT_THRESHOLD) {
          clearInterval(timer);
          
          setTimeout(() => {
            onTimeout?.(ERROR_MESSAGES.LOADING_FAILED);
            
            setTimeout(() => {
              onClose?.();
            }, 500);
          }, 0);
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [onTimeout, onClose]);
  
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
          <div className="w-16 h-16 border-4 
            border-t-[var(--accent-color)] 
            border-[var(--primary-color)] 
            rounded-full animate-spin mb-4"
          />
          
          <h3 className={`text-lg font-medium ${textStyles.default}`}>
            Chargement des statistiques...
          </h3>
          <p className={textStyles.subtle}>
            Veuillez patienter pendant la récupération des données.
          </p>
          
          {renderWarningMessage()}
        </div>
      </Card>
    </div>
  );
}

LoadingCard.propTypes = {
  onClose: PropTypes.func,
  onTimeout: PropTypes.func,
  error: PropTypes.object
};
