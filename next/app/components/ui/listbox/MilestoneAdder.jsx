'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import { textStyles } from '@/app/styles/tailwindStyles';

const toDDMMYYYY = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
};

export default function MilestoneAdder({ onAdd, onUpdate, editingItem }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.Title);
      setDate(toDDMMYYYY(editingItem.Date));
    } else {
      setTitle('');
      setDate('');
    }
  }, [editingItem]);

  const save = () => {
    if (!title.trim() || !/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      setErr('Titre & date JJ-MM-AAAA requis.');
      return;
    }
    setErr('');
    const [d, m, y] = date.split('-');
    const payload = { Title: title.trim(), Date: `${y}-${m}-${d}` };
    if (editingItem) {
      onUpdate(editingItem.id, { ...payload, value: `${payload.Title} – ${payload.Date}` });
    } else {
      onAdd({
        id: `n-${Date.now()}`,
        ...payload,
        value: `${payload.Title} – ${payload.Date}`,
      });
    }
  };

  return (
    <div className="space-y-2">
      <Input
        variant="default"
        placeholder="Nom milestone"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        variant="default"
        placeholder="JJ-MM-AAAA"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="flex justify-center">
        <Button type="button" variant="default" onClick={save}>
          <p className={textStyles.defaultWhite}>
            {editingItem ? 'Mettre à jour' : 'Ajouter'}
          </p>
        </Button>
      </div>
    </div>
  );
}
