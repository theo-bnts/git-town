'use client';

import React, { useRef, useState, useEffect } from 'react';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { DashIcon, XIcon } from '@primer/octicons-react';
import { textStyles, listboxStyles } from '@/app/styles/tailwindStyles';
import { processCsvFile } from '@/app/services/logic/importUsers';
import saveUser from '@/app/services/api/users/saveUser';
import getPromotions from '@/app/services/api/promotions/getPromotions';
import ComboBox from '@/app/components/ui/combobox/ComboBox';
import RejectListBox from '@/app/components/ui/listbox/RejectListBox';
import useAuthToken from '@/app/hooks/useAuthToken';
import { useNotification } from '@/app/context/NotificationContext';
import useCsvRejects from '@/app/hooks/useCsvRejects';

export default function ImportUserModal({ isOpen, onClose, onImport }) {
  const token = useAuthToken();
  const notify = useNotification();
  const fileInputRef = useRef(null);

  const { files: rejectFiles, saveRejectCsv, deleteRejectFile, download } = useCsvRejects('users');

  const [promoOpts, setPromoOpts] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);

  const [importedFile, setImportedFile] = useState(null);
  const [usersToProcess, setUsersToProcess] = useState([]);
  const [isValidated, setIsValidated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      getPromotions(token)
        .then(proms => {
          setPromoOpts(
            proms.map(p => ({
              id: p.Id,
              value: `${p.Diploma.Initialism} ${p.PromotionLevel.Initialism} - ${p.Year}`.replace('–', '-'),
              full: p
            }))
          );
        })
        .catch(() => notify('Erreur lors du chargement des promotions', 'error'));
    } else {
      clearFile();
      setSelectedPromo(null);
    }
  }, [isOpen, token]);

  function clearFile() {
    setImportedFile(null);
    setUsersToProcess([]);
    setIsValidated(false);
    setProgress(0);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        await saveRejectCsv(rejectCsv);
        notify('Fichier rejeté: données invalides', 'error');
        clearFile();
        return;
      } catch {
        notify('Erreur lors de l’enregistrement du rejet', 'error');
      }
    }

    setImportedFile(file);
    setUsersToProcess(users);
    setIsValidated(true);
    notify('CSV valide, prêt à être traité', 'success');
  }

  async function handleValidate(e) {
    e.preventDefault();
    if (!token) return notify('Vous devez être authentifié pour importer', 'error');
    if (!importedFile) return notify('Aucun fichier sélectionné', 'error');
    if (!isValidated || usersToProcess.length === 0) return notify('Rien à traiter', 'error');
    if (!selectedPromo?.id) return notify('Veuillez sélectionner une promotion', 'error');

    setIsProcessing(true);
    setProgress(0);
    const total = usersToProcess.length;
    const rejected = [];

    for (let i = 0; i < total; i++) {
      try {
        const created = await saveUser(null, usersToProcess[i], token);
        const newId = created?.Id || created?.id;
        if (!newId) throw new Error('Création utilisateur sans identifiant');
        if (usersToProcess[i].Role?.Keyword === 'student') {
          await saveUser(newId, { Promotions: [selectedPromo.id] }, token);
        }
      } catch (err) {
        rejected.push({ ...usersToProcess[i], reason: err.message });
      }
      setProgress(Math.round(((i + 1) / total) * 100));
    }

    if (rejected.length > 0) {
      let csv = 'EMAIL_ADDRESS,FULL_NAME,ROLE_KEYWORD,REASON\n';
      rejected.forEach(r => {
        const sanitize = s => `"${(s || '').replace(/"/g, '""')}"`;
        csv += [
          sanitize(r.EmailAddress),
          sanitize(r.FullName),
          sanitize(r.Role?.Keyword),
          sanitize(r.reason)
        ].join(',') + '\n';
      });
      try {
        await saveRejectCsv(csv);
        notify('Traitement terminé : certains utilisateurs ont échoué', 'error');
      } catch {
        notify('Erreur lors de l’enregistrement du rejet', 'error');
      }
    } else {
      notify('Tous les utilisateurs ont été créés', 'success');
      onImport?.();
    }

    setIsProcessing(false);
    clearFile();
  }

  function handleRemoveFile() {
    clearFile();
  }

  function handleExportSampleFile() {
    const a = document.createElement('a');
    a.href = '/api/csv/sample/users';
    a.download = 'sampleImportUsers.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--popup-color)] flex items-center justify-center z-50">
      <div className="w-[300px]">
        <Card variant="default" className="relative p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Import utilisateurs</h3>
            <Button variant="action_icon_warn" onClick={onClose}>
              <XIcon size={24} />
            </Button>
          </div>

          <div className="mt-4">
            <p className={`mb-1 ${textStyles.default}`}>Promotion</p>
            <ComboBox
              placeholder="Sélectionner promotion"
              options={promoOpts}
              value={selectedPromo}
              onSelect={setSelectedPromo}
            />
          </div>

          <div className="mt-4">
            <p className={`mb-1 ${textStyles.default}`}>Anciens rejets</p>
            <RejectListBox
              files={rejectFiles}
              onDownload={download}
              onDelete={deleteRejectFile}
            />
          </div>

          <div className="mt-4">
            <p className={`mb-1 ${textStyles.default}`}>Fichier exemple</p>
            <Button variant="default" onClick={handleExportSampleFile}>
              <p className={textStyles.defaultWhite}>Télécharger</p>
            </Button>
          </div>

          <form onSubmit={handleValidate} className="space-y-4 mt-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              style={{ display: 'none' }}
            />
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
                  onClick={() => fileInputRef.current?.click()}
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
