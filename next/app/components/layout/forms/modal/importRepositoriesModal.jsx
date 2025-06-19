'use client';

import React, { useRef, useState } from 'react';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { DashIcon, XIcon } from '@primer/octicons-react';
import { textStyles, listboxStyles } from '@/app/styles/tailwindStyles';
import { parseRepositoriesCsv } from '@/app/services/logic/importRepositories';
import saveRepositories from '@/app/services/api/repositories/saveRepositories';
import putUserRepository from '@/app/services/api/users/id/repositories/putUserRepository';
import ComboBox from '@/app/components/ui/combobox/ComboBox';
import RejectListBox from '@/app/components/ui/listbox/RejectListBox';
import getTemplates from '@/app/services/api/templates/getTemplates';
import getPromotions from '@/app/services/api/promotions/getPromotions';
import getUsers from '@/app/services/api/users/getUsers';
import { useNotification } from '@/app/context/NotificationContext';
import useAuthToken from '@/app/hooks/useAuthToken';
import useCsvRejects from '@/app/hooks/useCsvRejects';

export default function ImportRepositoriesModal({ isOpen, onClose, onImport }) {
  const token = useAuthToken();
  const notify = useNotification();
  const { files: rejectFiles, saveRejectCsv, deleteRejectFile, download } = useCsvRejects('repositories');

  const fileInputRef = useRef(null);
  const [templateOpts, setTemplateOpts] = useState([]);
  const [promotionOpts, setPromotionOpts] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [importedFile, setImportedFile] = useState(null);
  const [repositoriesToProcess, setRepositoriesToProcess] = useState([]);
  const [isValidated, setIsValidated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (!isOpen || !token) return;
    Promise.all([getTemplates(token), getPromotions(token)])
      .then(([tpls, proms]) => {
        setTemplateOpts(tpls.map(t => ({
          id: t.Id,
          value: `${t.EnseignementUnit.Initialism} - ${t.Year}`,
          full: t
        })));
        setPromotionOpts(proms.map(p => ({
          id: p.Id,
          value: `${p.Diploma.Initialism} ${p.PromotionLevel.Initialism} - ${p.Year}`,
          full: p
        })));
      })
      .catch(() => notify('Erreur lors du chargement des listes', 'error'));
  }, [isOpen, token]);

  const resetState = () => {
    setImportedFile(null);
    setRepositoriesToProcess([]);
    setIsValidated(false);
    setProgress(0);
    setIsProcessing(false);
    setSelectedTemplate(null);
    setSelectedPromotion(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) return notify('Veuillez sélectionner un fichier CSV', 'error');

    try {
      const { isValid, repositories, rejectCsv } = await parseRepositoriesCsv(file);
      if (!isValid) {
        await saveRejectCsv(rejectCsv);
        notify('Fichier rejeté : données invalides', 'error');
        resetState();
        return;
      }
      setImportedFile(file);
      setRepositoriesToProcess(repositories);
      setIsValidated(true);
      notify('CSV valide, prêt à être importé', 'success');
    } catch (err) {
      notify(err.message || 'Erreur lors du traitement du CSV', 'error');
    }
  };

  const promisePool = (items, limit, iterator) => {
    const results = [];
    let i = 0, done = 0;
    return new Promise(resolve => {
      const next = () => {
        if (done === items.length) return resolve(results);
        if (i === items.length) return;
        const idx = i++;
        iterator(items[idx])
          .then(r => results[idx] = { status: 'fulfilled', value: r })
          .catch(e => results[idx] = { status: 'rejected', reason: e })
          .finally(() => {
            done++;
            setProgress(Math.round((done / items.length) * 100));
            next();
          });
      };
      for (let k = 0; k < Math.min(limit, items.length); k++) next();
    });
  };

  const handleValidate = async e => {
    e.preventDefault();
    if (!token) return notify('Authentification requise', 'error');
    if (!isValidated) return notify('Rien à traiter', 'error');
    if (!selectedTemplate?.id) return notify('Sélectionnez un modèle', 'error');
    if (!selectedPromotion?.id) return notify('Sélectionnez une promotion', 'error');

    setIsProcessing(true);
    setProgress(0);

    try {
      const users = await getUsers(token);
      const emailToId = new Map(users.map(u => [u.EmailAddress.toLowerCase(), u.Id]));
      const rejected = [];

      const task = async ({ tutorEmail, studentEmails }) => {
        const tutorId = emailToId.get(tutorEmail.toLowerCase());
        if (!tutorId) throw new Error(`Tuteur introuvable : ${tutorEmail}`);

        const repo = await saveRepositories(null, {
          Template: { Id: selectedTemplate.id },
          Promotion: { Id: selectedPromotion.id },
          User: { Id: tutorId }
        }, token);

        await Promise.all(studentEmails.map(email => {
          const id = emailToId.get(email.toLowerCase());
          if (!id) throw new Error(`Étudiant introuvable : ${email}`);
          return putUserRepository(id, { Repository: { Id: repo.Id } }, token);
        }));
      };

      const results = await promisePool(repositoriesToProcess, 5, task);
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          const { tutorEmail, studentEmails } = repositoriesToProcess[i];
          rejected.push({
            tutorEmail,
            studentEmails: studentEmails.join('|'),
            reason: r.reason.message
          });
        }
      });

      if (rejected.length) {
        let csv = 'TUTOR_EMAIL,STUDENTS,REASON\n';
        const q = s => `"${(s || '').replace(/"/g, '""')}"`;
        rejected.forEach(r => {
          csv += [q(r.tutorEmail), q(r.studentEmails), q(r.reason)].join(',') + '\n';
        });
        await saveRejectCsv(csv);
        notify('Import terminé avec erreurs', 'error');
      } else {
        notify('Tous les dépôts ont été créés', 'success');
      }
      onImport?.();
    } catch (err) {
      notify(err.message || 'Erreur inattendue', 'error');
    } finally {
      setIsProcessing(false);
      resetState();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--popup-color)] flex items-center justify-center z-50">
      <div className="w-[300px]">
        <Card variant="default" className="relative p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Import dépôts (CSV)</h3>
            <Button variant="action_icon_warn" onClick={onClose}>
              <XIcon size={24} />
            </Button>
          </div>

          <div>
            <p className={`mb-1 ${textStyles.default}`}>Modèle</p>
            <ComboBox placeholder="Sélectionner modèle" options={templateOpts} value={selectedTemplate} onSelect={setSelectedTemplate} />
          </div>

          <div>
            <p className={`mb-1 ${textStyles.default}`}>Promotion</p>
            <ComboBox placeholder="Sélectionner promotion" options={promotionOpts} value={selectedPromotion} onSelect={setSelectedPromotion} />
          </div>

          <div>
            <p className={`mb-1 ${textStyles.default}`}>Anciens rejets</p>
            <RejectListBox files={rejectFiles} onDownload={download} onDelete={deleteRejectFile} />
          </div>

          <div>
            <p className={`mb-1 ${textStyles.default}`}>Fichier exemple</p>
            <Button variant="default" onClick={() => download('sampleImportRepositories.csv')}>
              <p className={textStyles.defaultWhite}>Télécharger</p>
            </Button>
          </div>

          <input type="file" ref={fileInputRef} accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} />

          <div>
            <p className={`mb-1 ${textStyles.default}`}>Fichier à importer</p>
            <div className={`flex flex-col space-y-2 ${listboxStyles.default}`}>
              <div className="max-h-[80px] overflow-y-auto border rounded-[12.5px]">
                {importedFile ? (
                  <div className="flex items-center justify-between p-2">
                    <span className={textStyles.default}>{importedFile.name}</span>
                    <Button variant="action_icon_warn" onClick={resetState}>
                      <DashIcon size={16} />
                    </Button>
                  </div>
                ) : (
                  <Card variant="empty_list">
                    <p className="text-center text-gray-600">Aucun fichier sélectionné.</p>
                  </Card>
                )}
              </div>
              <Button type="button" variant={!importedFile ? 'default' : 'disabled'} onClick={() => fileInputRef.current?.click()} disabled={!!importedFile}>
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
            <Button type="button" variant={!importedFile || isProcessing ? 'disabled' : 'default'} onClick={handleValidate} disabled={!importedFile || isProcessing}>
              <p className={textStyles.defaultWhite}>{isProcessing ? 'En cours…' : 'Traiter'}</p>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
