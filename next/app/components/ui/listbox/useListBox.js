'use client';

import { useContext } from 'react';
import ListBoxContext from './context';

export default function useListBox() {
  const context = useContext(ListBoxContext);
  if (!context) throw new Error('useListBox must be used inside a <ListBoxProvider>.');
  return context;
}
