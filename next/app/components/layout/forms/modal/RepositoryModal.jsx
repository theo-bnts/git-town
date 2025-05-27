'use client';

import { useState, useEffect, useMemo } from 'react';
import useAuthToken from '@/app/hooks/useAuthToken';
import { useNotification } from '@/app/context/NotificationContext';

import getUsers from '@/app/services/api/users/getUsers';
import getUsersRepository from '@/app/services/api/repositories/id/getUsersRepository';
import putUserRepository from '@/app/services/api/users/id/repositories/putUserRepository';
import deleteUserRepository from '@/app/services/api/users/id/repositories/deleteUserRepository';

import FormModal from '@/app/components/ui/modal/FormModal';
import StudentListBox from '@/app/components/ui/listbox/StudentListBox';

/**
 * Modal permettant d'associer / désassocier des étudiants à un dépôt.
 *
 * @param {boolean} isOpen
 * @param {object} repository - dépôt courant (min. { Id, Template, ...})
 * @param {function} onClose
 * @param {function} onSave - callback pour rafraîchir la vue après modification
 */
export default function RepositoryModal({ isOpen, repository, onClose, onSave }) {
  const token = useAuthToken();
  const notify = useNotification();

  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  useEffect(() => {
    if (!isOpen || !token || !repository?.Id) {
      if (!isOpen) {
        setStudentOptions([]);
        setSelectedStudents([]);
      }
      return;
    }
    setIsLoadingOptions(true);

    (async () => {
      try {
        const [allUsers, repoStudents] = await Promise.all([
          getUsers(token),
          getUsersRepository(repository.Id, token),
        ]);

        const studentOpts = allUsers
          .filter((u) => u.Role?.Keyword === 'student')
          .map((u) => ({
            id: u.Id,
            value: `${u.FullName} (${u.EmailAddress})`,
            full: u,
          }));
        setStudentOptions(studentOpts);

        const preSelected = repoStudents
          .map((stu) => studentOpts.find((o) => o.id === stu.Id))
          .filter(Boolean);
        setSelectedStudents(preSelected);
      } catch (err) {
        console.error(err);
        notify(err.message || 'Erreur lors du chargement des étudiants', 'error');
      } finally {
        setIsLoadingOptions(false);
      }
    })();
  }, [isOpen, token, repository?.Id, notify]);

  const fields = useMemo(
    () => [
      {
        name: 'Étudiants',
        value: selectedStudents,
        render: (value, onChange) => (
          <StudentListBox
            items={value}
            studentOptions={studentOptions}
            onChange={onChange}
          />
        ),
      },
    ],
    [selectedStudents, studentOptions]
  );

  function validate(v) {
    const e = {};
    if (!Array.isArray(v.Étudiants) || v.Étudiants.length === 0) {
      e.Étudiants = 'Sélectionnez au moins un étudiant.';
    }
    return e;
  }

  const handleSubmit = async (values) => {
    const errs = validate(values);
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    const origIds = selectedStudents.map((s) => s.id).sort();
    const newIds = (Array.isArray(values.Étudiants) ? values.Étudiants : []).map((s) => s.id).sort();

    const toAdd = newIds.filter((id) => !origIds.includes(id));
    const toRemove = origIds.filter((id) => !newIds.includes(id));

    if (toAdd.length === 0 && toRemove.length === 0) {
      onClose();
      return;
    }

    try {
      await Promise.all([
        ...toAdd.map((userId) =>
          putUserRepository(userId, { Repository: { Id: repository.Id } }, token)
        ),
        ...toRemove.map((userId) => deleteUserRepository(userId, token)),
      ]);

      notify('Liste des étudiants mise à jour', 'success');
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      notify(err.message || 'Erreur lors de la mise à jour', 'error');
    }
  };

  if (!repository?.Id) return null;

  return (
    <FormModal
      formKey={`${repository.Id}-${isOpen}`}
      isOpen={isOpen}
      title={`Étudiants du dépôt ${repository.Template?.EnseignementUnit?.Initialism || ''}`}
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
