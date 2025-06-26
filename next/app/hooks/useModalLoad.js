import { useState, useCallback } from 'react';

export default function useModalLoad(isOpen) {
  const [loading, setLoading] = useState(false);

  const wrap = useCallback(
    async (fn) => {
      if (!isOpen) return;
      setLoading(true);
      try { return await fn(); }
      finally { setLoading(false); }
    },
    [isOpen]
  );

  return { loading, wrap };
}
