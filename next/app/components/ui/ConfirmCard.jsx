'use client';

import React from 'react';
import { buttonStyles, textStyles, cardStyles } from '@/app/styles/tailwindStyles';

export default function ConfirmCard({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className={`${cardStyles.default} flex flex-col p-6`}>
        <p className={`${textStyles.default} text-center`}>{message}</p>
        <div className="flex gap-4 mt-4 ml-auto">
          <button
            onClick={onConfirm}
            className={`${buttonStyles.default} ${textStyles.defaultWhite}`}
          >
            Continuer
          </button>
          <button
            onClick={onCancel}
            className={`${buttonStyles.warn} ${textStyles.defaultWhite}`}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}