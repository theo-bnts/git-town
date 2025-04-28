'use client';

import { createContext } from 'react';

/**
 * React context used by every ListBox‑related component.
 * Exposed separately so that provider & hooks live in their own files.
 */
const ListBoxContext = createContext(null);

export default ListBoxContext;
