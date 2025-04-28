'use client';

import { useContext } from 'react';
import ListBoxContext from './context';

/**
 * Hook to access ListBox context.
 */
export default function useListBox() {
  const ctx = useContext(ListBoxContext);
  if (!ctx) throw new Error('useListBox must be used inside a <ListBoxProvider>.');
  return ctx;
}
