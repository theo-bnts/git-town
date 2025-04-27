'use client';

import React, { useState, useEffect, useRef } from 'react';
import Card from '@/app/components/ui/Card';
import { DashIcon, PencilIcon } from '@primer/octicons-react';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import { listboxStyles, textStyles } from '@/app/styles/tailwindStyles';

export default function MilestoneListBox({ initial = [], onChange }) {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const nextKey = useRef(1);

  useEffect(() => {
    const seeded = initial.map(item => ({
      ...item,
      localKey: nextKey.current++,
    }));
    setItems(seeded);
  }, [initial]);

  const resetForm = () => {
    setTitle('');
    setDate('');
    setEditingKey(null);
    setError('');
  };

  const validate = () => {
    if (!title.trim() || !/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      setError('Titre & date JJ-MM-AAAA requis.');
      return false;
    }
    return true;
  };

  const saveMilestone = () => {
    if (!validate()) return;
    const [day, month, year] = date.split('-');
    const milestoneData = {
      Title: title.trim(),
      Date: `${year}-${month}-${day}`,
      value: `${title.trim()} – ${year}-${month}-${day}`,
    };

    const updated = editingKey != null
      ? items.map(item =>
          item.localKey === editingKey
            ? { ...item, ...milestoneData }
            : item
        )
      : [
          ...items,
          { localKey: nextKey.current++, ...milestoneData }
        ];

    setItems(updated);
    onChange(updated);
    resetForm();
  };

  const removeMilestone = key => {
    const updated = items.filter(item => item.localKey !== key);
    setItems(updated);
    onChange(updated);
    if (editingKey === key) resetForm();
  };

  const startEditing = item => {
    setEditingKey(item.localKey);
    setTitle(item.Title);
    const [year, month, day] = item.Date.split('-');
    setDate(`${day}-${month}-${year}`);
    setError('');
  };

  return (
    <div className={`flex flex-col space-y-2 ${listboxStyles.default}`}>
      <div className="flex flex-col bg-white border border-gray-200 rounded-[12.5px] overflow-hidden">
        <div className="max-h-[160px] overflow-y-auto">
          {items.length === 0 ? (
            <Card variant="empty_list">
              <p className="text-center text-gray-600">Aucun élément sélectionné.</p>
            </Card>
          ) : (
            items
              .slice()
              .sort((a, b) => a.value.localeCompare(b.value))
              .map(item => (
                <div
                  key={item.localKey}
                  className="flex items-center justify-between px-4 py-2"
                >
                  <span>{item.value}</span>
                  <Button
                    type="button"
                    onClick={() => startEditing(item)}
                    variant="action_icon"
                  >
                    <PencilIcon size={16} />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => removeMilestone(item.localKey)}
                    variant="action_icon_warn"
                  >
                    <DashIcon size={16} />
                  </Button>
                </div>
              ))
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Input
          variant="default"
          placeholder="Nom milestone"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <Input
          variant="default"
          placeholder="JJ-MM-AAAA"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-center space-x-2">
          <Button type="button" variant="default" onClick={saveMilestone}>
            <p className={textStyles.defaultWhite}>
              {editingKey != null ? 'Mettre à jour' : 'Ajouter milestone'}
            </p>
          </Button>
          {editingKey != null && (
            <Button type="button" variant="default" onClick={resetForm}>
              <p className={textStyles.defaultWhite}>Annuler</p>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
