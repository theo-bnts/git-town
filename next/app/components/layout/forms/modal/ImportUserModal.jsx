'use client';

import React, { useRef, useState, useEffect } from 'react';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { DashIcon, XIcon } from '@primer/octicons-react';
import { textStyles, listboxStyles } from '@/app/styles/tailwindStyles';
import { processCsvFile } from '@/app/services/logic/importUsers';
import saveUser from '@/app/services/api/users/saveUser';
import { getCookie } from '@/app/services/cookies';

export default function ImportUserModal({ isOpen, onClose, onImport }) {
  const fileInputRef = useRef(null);
  const [importedFile, setImportedFile] = useState(null);
  const [usersToProcess, setUsersToProcess] = useState([]);
  const [isValidated, setIsValidated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');

  useEffect(() => {
    (async () => {
      const token = await getCookie('token');
      if (token) setAuthToken(token);
    })();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      clearFileSelection();
      setAlertMessage('');
      setAlertType('');
    }
  }, [isOpen]);

  const clearFileSelection = () => {
    setImportedFile(null);
    setUsersToProcess([]);
    setIsValidated(false);
    setProgress(0);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportFile = () => {
    fileInputRef.current?.click();
  };

  const buildRejectedCsvContent = (rejectedUsers) => {
    let csv = 'EMAIL_ADDRESS,FULL_NAME,ROLE_KEYWORD,REASON\n';
    rejectedUsers.forEach(({ EmailAddress, FullName, Role, reason }) => {
      const roleKeyword = Role?.Keyword || '';
      const sanitize = (str) => `"${(str || '').replace(/"/g, '""')}"`;
      csv += `${sanitize(EmailAddress)},${sanitize(FullName)},${sanitize(roleKeyword)},${sanitize(reason)}\n`;
    });
    return csv;
  };

  async function uploadRejectsCsvToServer(fileName, csvContent) {
    const res = await fetch('/api/csv/rejects/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvContent, fileName })
    });
    if (!res.ok) {
      throw new Error('Erreur lors de la sauvegarde du fichier CSV de rejets.');
    }
    const data = await res.json();
    return data.fileName;
  }

  const downloadCsvFromServer = (fileName) => {
    const url = `/api/csv/rejects/?filename=${encodeURIComponent(fileName)}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSampleFile = () => {
    const link = document.createElement('a');
    link.href = '/api/csv/sample/';
    link.download = 'sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setAlertMessage('Veuillez sélectionner un fichier CSV.');
      setAlertType('warn');
      return;
    }

    const { isValid, errors, users } = await processCsvFile(file);

    if (!isValid) {
      const rejectedRows = errors.map(err => ({
        EmailAddress: '',
        FullName: '',
        Role: { Keyword: '' },
        reason: `Ligne ${err.line} : ${err.message}`
      }));
      const csvRejected = buildRejectedCsvContent(rejectedRows);
      
      try {
        const savedName = await uploadRejectsCsvToServer(undefined, csvRejected);
        downloadCsvFromServer(savedName);
      } catch (err) {
        console.error(err);
      }
      
      setAlertMessage('Le fichier comporte des erreurs, rejeté dans son intégralité.');
      setAlertType('warn');
      clearFileSelection();
    } else {
      setImportedFile(file);
      setUsersToProcess(users);
      setIsValidated(true);
      setAlertMessage('Fichier valide ! Vous pouvez cliquer sur "Traiter".');
      setAlertType('success');
    }
  };

  const handleRemoveFile = () => {
    clearFileSelection();
  };

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!importedFile) {
      setAlertMessage('Aucun fichier sélectionné.');
      setAlertType('warn');
      return;
    }
    if (!authToken) {
      setAlertMessage('Aucun token trouvé.');
      setAlertType('warn');
      return;
    }
    if (!isValidated || usersToProcess.length === 0) {
      setAlertMessage('Le fichier n’est pas valide ou est vide.');
      setAlertType('warn');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const total = usersToProcess.length;
    const rejectedFromApi = [];

    for (let i = 0; i < total; i++) {
      try {
        await saveUser(null, usersToProcess[i], authToken);
      } catch (err) {
        rejectedFromApi.push({
          ...usersToProcess[i],
          reason: err.message || 'Erreur inconnue'
        });
      }
      setProgress(Math.round(((i + 1) / total) * 100));
    }

    if (rejectedFromApi.length > 0) {
      const csvRejected = buildRejectedCsvContent(rejectedFromApi);
      try {
        const savedName = await uploadRejectsCsvToServer(undefined, csvRejected);
        downloadCsvFromServer(savedName);
      } catch (err) {
        console.error(err);
      }
      
      setAlertMessage('Traitement terminé, certains utilisateurs n’ont pas pu être créés.');
      setAlertType('warn');
    } else {
      setAlertMessage('Tous les utilisateurs ont été créés avec succès !');
      setAlertType('success');
    }

    setIsProcessing(false);
    clearFileSelection();
    if (onImport) onImport();
  };

  return !isOpen ? null : (
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
            style={{ display: 'none' }}
            accept=".csv,text/csv"
          />

          <div>
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
                  variant={importedFile ? 'disabled' : 'default'}
                  type="button"
                  onClick={!importedFile ? handleImportFile : undefined}
                  disabled={!!importedFile}
                >
                  <p className={textStyles.defaultWhite}>Importer</p>
                </Button>
              </div>
            </div>

            {isProcessing && (
              <div className="w-full bg-gray-300 rounded-full h-2.5 mt-2">
                <div className="bg-[var(--accent-color)] h-2.5 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            )}

            <div className="flex justify-center pt-2">
              <Button
                variant={!importedFile ? 'disabled' : 'default'}
                type="submit"
                disabled={!importedFile || isProcessing}
              >
                <p className={textStyles.defaultWhite}>{isProcessing ? 'En cours...' : 'Traiter'}</p>
              </Button>
            </div>
          </form>
        </Card>
        
        {alertMessage && (
            <div className="mt-4">
              <Card variant={alertType} className="w-full">
                <div className="flex items-center">
                  <p className="flex-1">{alertMessage}</p>
                  <Button
                    variant="cancel_action_sq"
                    onClick={() => setAlertMessage('')}
                    className="ml-2 transition-transform duration-200 hover:scale-110"
                  >
                    <XIcon size={20} />
                  </Button>
                </div>
              </Card>
            </div>
          )}
      </div>
    </div>
  );
}
