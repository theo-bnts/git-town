'use client';

import React, { useRef, useState, useEffect } from 'react';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { DashIcon, XIcon } from '@primer/octicons-react';
import { textStyles, listboxStyles } from '@/app/styles/tailwindStyles';
import { processCsvFile } from '@/app/services/logic/importUsers';
import saveUser from '@/app/services/api/users/saveUser';
import RejectListBox from '@/app/components/ui/listbox/RejectListBox';
import getRejectFiles from '@/app/services/logic/csv/rejects/getRejectFile';
import deleteRejectFile from '@/app/services/logic/csv/rejects/deleteRejectsFile';
import { useNotification } from '@/app/context/NotificationContext';
import useAuthToken from '@/app/hooks/useAuthToken';

export default function ImportUserModal({ isOpen, onClose, onImport }) {
  const fileInputRef = useRef(null);
  const notify = useNotification();
  const token = useAuthToken();

  const [importedFile, setImportedFile] = useState(null);
  const [usersToProcess, setUsersToProcess] = useState([]);
  const [isValidated, setIsValidated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectFiles, setRejectFiles] = useState([]);

  useEffect(() => {
    if (isOpen) refreshRejects();
    else clearFile();
  }, [isOpen]);

  async function refreshRejects() {
    try {
      const files = await getRejectFiles();
      setRejectFiles(files);
    } catch (err) {
      console.error(err);
      notify('Impossible de charger les rejets', 'error');
    }
  }

  function clearFile() {
    setImportedFile(null);
    setUsersToProcess([]);
    setIsValidated(false);
    setProgress(0);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleImportFile() {
    fileInputRef.current?.click();
  }

  function handleExportSampleFile() {
    const link = document.createElement('a');
    link.href = '/api/csv/sample/';
    link.download = 'sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function uploadRejectsCsvToServer(_, csvContent) {
    const res = await fetch('/api/csv/rejects/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvContent })
    });
    if (!res.ok) throw new Error('Erreur lors de l’enregistrement des rejets');
    return (await res.json()).fileName;
  }

  function downloadCsvFromServer(filename) {
    const url = `/api/csv/rejects/${encodeURIComponent(filename)}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function handleDeleteReject(filename) {
    try {
      await deleteRejectFile(filename);
      setRejectFiles(files => files.filter((f) => f !== filename));
      notify(`Fichier de Rejets : "${filename}" supprimé`, 'success');
    } catch {
      notify('Échec de la suppression', 'error');
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      notify('Veuillez sélectionner un CSV', 'error');
      return;
    }

    const { isValid, users, rejectCsv } = await processCsvFile(file);
    if (!isValid) {
      try {
        const name = await uploadRejectsCsvToServer(undefined, rejectCsv);
        downloadCsvFromServer(name);
        await refreshRejects();
      } catch {
        notify('Erreur lors de l’enregistrement du rejet', 'error');
      }
      notify('Fichier rejeté: données invalides', 'error');
      clearFile();
      return;
    }

    setImportedFile(file);
    setUsersToProcess(users);
    setIsValidated(true);
    notify('CSV valide, prêt à être traité', 'success');
  }

  function handleRemoveFile() {
    clearFile();
  }

  async function handleValidate(e) {
    e.preventDefault();
    if (!token) {
      notify('Vous devez être authentifié pour importer', 'error');
      return;
    }
    if (!importedFile) {
      notify('Aucun fichier sélectionné', 'error');
      return;
    }
    if (!isValidated || usersToProcess.length === 0) {
      notify('Rien à traiter', 'error');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const total = usersToProcess.length;
    const rejected = [];

    for (let i = 0; i < total; i++) {
      try {
        await saveUser(null, usersToProcess[i], token);
      } catch (err) {
        rejected.push({ ...usersToProcess[i], reason: err.message });
      }
      setProgress(Math.round(((i + 1) / total) * 100));
    }

    if (rejected.length > 0) {
      let csv = 'EMAIL_ADDRESS,FULL_NAME,ROLE_KEYWORD,REASON\n';
      rejected.forEach(r => {
        const sanitize = (s) => `"${(s || '').replace(/"/g, '""')}"`;
        csv += [
          sanitize(r.EmailAddress),
          sanitize(r.FullName),
          sanitize(r.Role?.Keyword),
          sanitize(r.reason)
        ].join(',') + '\n';
      });
      try {
        const name = await uploadRejectsCsvToServer(undefined, csv);
        downloadCsvFromServer(name);
        await refreshRejects();
      } catch {
        notify('Erreur lors de l’enregistrement du rejet', 'error');
      }
      notify('Traitement terminé : certains utilisateurs ont échoué', 'error');
    } else {
      notify('Tous les utilisateurs ont été créés', 'success');
      await refreshRejects();
    }

    setIsProcessing(false);
    clearFile();
    onImport?.();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--popup-color)] flex items-center justify-center z-50">
      <div className="w-[300px]">
        <Card variant="default" className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Import CSV</h3>
            <Button variant="action_icon_warn" onClick={onClose}>
              <XIcon size={24} />
            </Button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            style={{ display: 'none' }}
          />

          <div className="mt-4">
            <p className={`mb-1 ${textStyles.default}`}>Anciens rejets</p>
            <RejectListBox
              files={rejectFiles}
              onDownload={downloadCsvFromServer}
              onDelete={handleDeleteReject}
            />
          </div>

          <div className="mt-4">
            <p className={`mb-1 ${textStyles.default}`}>Fichier exemple</p>
            <Button variant="default" onClick={handleExportSampleFile}>
              <p className={textStyles.defaultWhite}>Télécharger</p>
            </Button>
          </div>

          <form onSubmit={handleValidate} className="space-y-4 mt-4">
            <div>
              <p className={`mb-1 ${textStyles.default}`}>Fichier à importer</p>
              <div className={`flex flex-col space-y-2 ${listboxStyles.default}`}>
                <div className="max-h-[80px] overflow-y-auto border rounded-[12.5px]">
                  {importedFile ? (
                    <div className="flex items-center justify-between p-2">
                      <span className={textStyles.default}>{importedFile.name}</span>
                      <Button variant="action_icon_warn" onClick={handleRemoveFile}>
                        <DashIcon size={16} />
                      </Button>
                    </div>
                  ) : (
                    <Card variant="empty_list">
                      <p className="text-center text-gray-600">Aucun fichier sélectionné.</p>
                    </Card>
                  )}
                </div>
                <Button
                  type="button"
                  variant={!importedFile ? 'default' : 'disabled'}
                  onClick={handleImportFile}
                  disabled={!!importedFile}
                >
                  <p className={textStyles.defaultWhite}>Importer</p>
                </Button>
              </div>
            </div>

            {isProcessing && (
              <div className="w-full bg-gray-300 rounded-full h-2.5 mt-2">
                <div
                  className="bg-[var(--accent-color)] h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                variant={!importedFile || isProcessing ? 'disabled' : 'default'}
                disabled={!importedFile || isProcessing}
              >
                <p className={textStyles.defaultWhite}>
                  {isProcessing ? 'En cours…' : 'Traiter'}
                </p>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
