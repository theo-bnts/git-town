'use client';

import { useCallback, useEffect, useState } from 'react';
import getReject from '@/app/services/logic/csv/rejects/getReject';
import deleteReject from '@/app/services/logic/csv/rejects/deleteReject';
import { useNotification } from '@/app/context/NotificationContext';

export default function useCsvRejects(type) {
  const notify = useNotification();
  const [files, setFiles] = useState([]);

  const refresh = useCallback(async () => {
    try {
      const result = await getReject(type);
      setFiles(result);
    } catch {
      notify('Impossible de charger les rejets', 'error');
    }
  }, [type, notify]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveRejectCsv = async csvContent => {
    const res = await fetch(`/api/csv/rejects/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvContent })
    });
    if (!res.ok) throw new Error('Enregistrement du rejet impossible');
    const { fileName } = await res.json();
    download(fileName);
    refresh();
  };

  const download = name => {
    const a = document.createElement('a');
    a.href = `/api/csv/rejects/${type}/${encodeURIComponent(name)}`;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const deleteRejectFile = async name => {
    await deleteReject(type, name);
    setFiles(prev => prev.filter(f => f !== name));
    notify(`Rejet « ${name} » supprimé`, 'success');
  };

  return { files, refresh, saveRejectCsv, download, deleteRejectFile };
}
