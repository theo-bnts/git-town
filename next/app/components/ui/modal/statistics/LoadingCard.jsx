'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Spinner from '@/app/components/ui/Spinner';
import { XIcon } from '@primer/octicons-react';
import PropTypes from 'prop-types';
import { textStyles } from '@/app/styles/tailwindStyles';
import { STATISTICS_CONFIG } from '@/app/config/config';

const { ERROR_MESSAGES, LOADING } = STATISTICS_CONFIG;
const { 
  TIMEOUT_THRESHOLD, 
  FIRST_WARNING_THRESHOLD, 
  SECOND_WARNING_THRESHOLD,
  MESSAGES
} = LOADING;

export default function LoadingCard({ 
  onClose, 
  onTimeout, 
  error, 
  hasPartialData = false, 
  autoRetrying = false }) {

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
    if (hasPartialData || autoRetrying) {
      return;
    }
    
    const timer = setInterval(() => {
      setLoadingTime(prev => {
        const newTime = prev + 1;
        if (newTime >= TIMEOUT_THRESHOLD) {
          clearInterval(timer);
          
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
        {MESSAGES.LONG_WAIT_WARNING}
        {loadingTime > SECOND_WARNING_THRESHOLD && ` ${MESSAGES.VERY_LONG_WAIT_WARNING}`}
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
            {autoRetrying ? MESSAGES.AUTO_RETRYING_TITLE : MESSAGES.STANDARD_TITLE}
          </h3>
          <p className={textStyles.subtle}>
            {autoRetrying 
              ? MESSAGES.AUTO_RETRYING_SUBTITLE
              : MESSAGES.STANDARD_SUBTITLE}
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
