'use client';

import React, { useState } from 'react';
import ListBoxArea    from '@/app/components/ui/listbox/ListBoxArea';
import Input          from '@/app/components/ui/Input';
import Button         from '@/app/components/ui/Button';
import { listboxStyles } from '@/app/styles/tailwindStyles';

export default function MilestoneListBox({ initial = [], onChange }) {
  const [items, setItems] = useState(initial);
  const [title, setTitle] = useState('');
  const [date , setDate ] = useState('');
  const [err  , setErr  ] = useState('');

  const add = () => {
    if (!title.trim() || !/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      setErr('Titre & date JJ-MM-AAAA requis.');
      return;
    }
    setErr('');
    const [d, m, y] = date.split('-');
    const obj = {
      id   : `n-${Date.now()}`,
      Title: title.trim(),
      Date : `${y}-${m}-${d}`,
      value: `${title.trim()} – ${y}-${m}-${d}`,
    };
    const next = [...items, obj];
    setItems(next);
    onChange?.(next);
    setTitle(''); setDate('');
  };

  const remove = (id) => {
    const next = items.filter((it) => it.id !== id);
    setItems(next);
    onChange?.(next);
  };

  return (
    <div className={`flex flex-col space-y-2 ${listboxStyles.default}`}>
      <ListBoxArea items={items} onRemove={remove} />

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
          <Button type="button" variant="default" onClick={add}>
            Ajouter Milestone
          </Button>
        </div>
      </div>
    </div>
  );
}
