'use client';

import React, { Suspense } from 'react';
import AuthorizePageContent from './AuthorizePageContent';

export default function AuthorizePage() {
  return (
    <Suspense fallback={<div>En cours d'association github</div>}>
      <AuthorizePageContent />
    </Suspense>
  );
}
