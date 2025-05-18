'use client';

import React, { useState } from 'react';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import { listboxStyles, textStyles } from '@/app/styles/tailwindStyles';

import ListBoxProvider from '@/app/components/ui/listbox/ListBoxProvider';
import ListBoxArea from '@/app/components/ui/listbox/ListBoxArea';
import useListBox from '@/app/components/ui/listbox/useListBox';

export default function MilestoneListBox({ items, onChange }) {
  return (
    <div className={`flex flex-col space-y-2 ${listboxStyles.default}`}>
      <ListBoxProvider items={items} onChange={onChange}>
        <MilestoneInner />
      </ListBoxProvider>
    </div>
  );
}

function MilestoneInner() {
  const {addItem, updateItem} = useListBox();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const reset = () => {
    setTitle('');
    setDate('');
    setEditingId(null);
    setError('');
  };

  const validate = () => {
    if (!title.trim() || !/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      setError('Titre & date JJ-MM-AAAA requis.');
      return false;
    }
    return true;
  };

  const save = () => {
    if (!validate()) return;
    const [d, m, y] = date.split('-');
    const data = { Title: title.trim(), Date: `${y}-${m}-${d}` };

    if (editingId) {
      updateItem(editingId, data);
    } else {
      addItem({ id: `local-${Date.now()}`, ...data });
    }
    reset();
  };

  return (
    <>
      <ListBoxArea
        renderChip={(item) => (
          <div className="flex flex-col">
            <span className="font-medium">{item.Title}</span>
            <span className="text-sm text-gray-500">{item.Date}</span>
          </div>
        )}
        onEdit={(item) => {
          setEditingId(item.id);
          setTitle(item.Title);
          const [y, m, d] = item.Date.split('-');
          setDate(`${d}-${m}-${y}`);
        }}
      />

        <Input variant="default" placeholder="Nom milestone" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input variant="default" placeholder="JJ-MM-AAAA" value={date} onChange={(e) => setDate(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-center space-x-2">
          <Button type="button" variant="default" onClick={save}>
            <p className={textStyles.defaultWhite}>{editingId ? 'Mettre à jour' : 'Ajouter'}</p>
          </Button>
          {editingId && (
            <Button type="button" variant="default" onClick={reset}>
              <p className={textStyles.defaultWhite}>Annuler</p>
            </Button>
          )}
        </div>
    </>
  );
}
