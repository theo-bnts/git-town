'use client';
import { useState, useEffect, useMemo } from 'react';

import useAuthToken from '@/app/hooks/useAuthToken';
import { useNotification } from '@/app/context/NotificationContext';

import getTemplates from '@/app/services/api/templates/getTemplates';
import getPromotions from '@/app/services/api/promotions/getPromotions';
import getUsers from '@/app/services/api/users/getUsers';
import getUsersRepository from '@/app/services/api/repositories/id/getUsersRepository';
import saveRepositories from '@/app/services/api/repositories/saveRepositories';
import putUserRepository from '@/app/services/api/users/id/repositories/putUserRepository';
import deleteUserRepository from '@/app/services/api/users/id/repositories/deleteUserRepository';
import replicateRepository from '@/app/services/api/repositories/id/replicateRepository';

import FormModal from '@/app/components/ui/modal/FormModal';
import StudentListBox from '@/app/components/ui/listbox/StudentListBox';

export default function RepositoryModal({
  isOpen,
  initialData = {},
  duplicatedFromId = null,
  onClose,
  onSave,
}) {
  const token = useAuthToken();
  const notify = useNotification();

  const [templateOpts, setTemplateOpts] = useState([]);
  const [promotionOpts, setPromotionOpts] = useState([]);
  const [tutorOpts, setTutorOpts] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [originalStudents, setOriginalStudents] = useState([]);

  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});

  const repository = initialData;

  useEffect(() => {
    if (!isOpen || !token) {
      if (!isOpen) {
        setTemplateOpts([]);
        setPromotionOpts([]);
        setTutorOpts([]);
        setStudentOptions([]);
        setSelectedStudents([]);
        setOriginalStudents([]);
      }
      return;
    }

    setIsLoadingOptions(true);
    (async () => {
      try {
        const [tpls, proms, users, repoStudents] = await Promise.all([
          getTemplates(token),
          getPromotions(token),
          getUsers(token),
          repository?.Id
            ? getUsersRepository(repository.Id, token)
            : duplicatedFromId
            ? getUsersRepository(duplicatedFromId, token)
            : Promise.resolve([]),
        ]);

        setTemplateOpts(
          tpls.map(t => ({
            id: t.Id,
            value: `${t.EnseignementUnit.Initialism} - ${t.Year}`,
            full: t,
          }))
        );

        setPromotionOpts(
          proms.map(p => ({
            id: p.Id,
            value: `${p.Diploma.Initialism} ${p.PromotionLevel.Initialism} - ${p.Year}`,
            full: p,
          }))
        );

        setTutorOpts(
          users
            .filter(u => u.Role?.Keyword !== 'student')
            .map(u => ({
              id: u.Id,
              value: u.FullName,
              full: u,
            }))
        );

        const studentOpts = users
          .filter(u => u.Role?.Keyword === 'student')
          .map(u => ({
            id: u.Id,
            value: u.FullName,
            label: `${u.FullName} (${u.EmailAddress})`,
            full: u,
          }));
        setStudentOptions(studentOpts);

        const preSelected = repoStudents
          .map(stu => studentOpts.find(o => o.id === stu.Id))
          .filter(Boolean);
        setSelectedStudents(preSelected);
        setOriginalStudents(repository.Id ? preSelected : []);
      } catch (err) {
        notify(err.message || 'Erreur lors du chargement des options', 'error');
      } finally {
        setIsLoadingOptions(false);
      }
    })();
  }, [isOpen, token, repository?.Id, duplicatedFromId, notify]);

  const initTemplateOpt = useMemo(
    () => templateOpts.find(o => o.id === repository.Template?.Id) || null,
    [templateOpts, repository.Template]
  );
  const initPromotionOpt = useMemo(
    () => promotionOpts.find(o => o.id === repository.Promotion?.Id) || null,
    [promotionOpts, repository.Promotion]
  );
  const initTutorOpt = useMemo(
    () => tutorOpts.find(o => o.id === repository.User?.Id) || null,
    [tutorOpts, repository.User]
  );

  const fields = useMemo(() => [
    { name: 'Modèle', options: templateOpts, value: initTemplateOpt },
    { name: 'Promotion', options: promotionOpts, value: initPromotionOpt },
    { name: 'Tuteur', options: tutorOpts, value: initTutorOpt },
    {
      name: 'Étudiants',
      value: selectedStudents,
      render: (value, onChange) => (
        <StudentListBox
          items={value}
          onChange={onChange}
          studentOptions={studentOptions}
          placeholder="Ajouter un étudiant"
        />
      ),
    },
  ], [
    templateOpts,
    promotionOpts,
    tutorOpts,
    studentOptions,
    initTemplateOpt,
    initPromotionOpt,
    initTutorOpt,
    selectedStudents,
  ]);

  function validate(values) {
    const errs = {};
    if (!values['Modèle']?.id) errs['Modèle'] = 'Sélectionnez un modèle.';
    if (!values['Promotion']?.id) errs['Promotion'] = 'Sélectionnez une promotion.';
    if (!values['Tuteur']?.id) errs['Tuteur'] = 'Sélectionnez un tuteur.';
    return errs;
  }

  const handleSubmit = async values => {
    const errs = validate(values);
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    const { Modèle: modele, Promotion: promotion, Tuteur: tuteur, Étudiants: etudiants = [] } = values;
    let repoPayload = {};

    if (!repository.Id) {
      repoPayload = {
        Template: { Id: modele.id },
        Promotion: { Id: promotion.id },
        User: { Id: tuteur.id },
      };
    } else {
      if (modele.id !== repository.Template?.Id)
        repoPayload.Template = { Id: modele.id };
      if (promotion.id !== repository.Promotion?.Id)
        repoPayload.Promotion = { Id: promotion.id };
      if (tuteur.id !== repository.User?.Id)
        repoPayload.User = { Id: tuteur.id };
    }

    const origIds = originalStudents.map(s => s.id).sort();
    const newIds = etudiants.map(s => s.id).sort();
    const toAdd = repository.Id
      ? newIds.filter(id => !origIds.includes(id))
      : newIds;
    const toRemove = repository.Id
      ? origIds.filter(id => !newIds.includes(id))
      : [];

    if (
      repository.Id &&
      Object.keys(repoPayload).length === 0 &&
      toAdd.length === 0 &&
      toRemove.length === 0 &&
      !duplicatedFromId
    ) {
      onClose();
      return;
    }

    try {
      let repoId = repository.Id;
      if (Object.keys(repoPayload).length > 0) {
        const saved = await saveRepositories(repoId || null, repoPayload, token);
        repoId = saved.Id;
      }

      if (repoId && (toAdd.length || toRemove.length)) {
        await Promise.all([
          ...toAdd.map(userId =>
            putUserRepository(userId, { Repository: { Id: repoId } }, token)
          ),
          ...toRemove.map(userId =>
            deleteUserRepository(userId, repoId, token)
          ),
        ]);
      }

      if (duplicatedFromId) {
        notify('Duplication du dépôt en cours, veuillez patienter...', 'success');
        await replicateRepository(duplicatedFromId, repoId, token);
      }

      notify(
        repository.Id ? 'Dépôt mis à jour avec succès' : 'Nouveau dépôt créé avec succès',
        'success'
      );
      onSave();
      onClose();
    } catch (err) {
      notify(err.message || 'Erreur lors de l’enregistrement du dépôt', 'error');
    }
  };

  if (!isOpen) return null;

  const modalTitle = repository.Id
    ? 'Modifier le dépôt'
    : duplicatedFromId
    ? 'Duplication dépôt'
    : 'Nouveau dépôt';

  return (
    <FormModal
      formKey={`${repository.Id || 'new'}-${isOpen}`}
      isOpen={isOpen}
      title={modalTitle}
      metadata={{
        createdAt: repository.CreatedAt,
        updatedAt: repository.UpdatedAt,
      }}
      fields={fields}
      errors={fieldErrors}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isLoadingOptions}
    />
  );
}
