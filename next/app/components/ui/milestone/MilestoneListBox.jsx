'use client';

import React, { useState } from 'react';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import ListBoxArea from '@/app/components/ui/listbox/ListBoxArea';
import { PlusIcon } from '@primer/octicons-react';
import { textStyles } from '@/app/styles/tailwindStyles';

export default function MilestoneListBox({ items, onAdd, onRemove, onEdit }) {
  const [open, setOpen]         = useState(false);
  const [title, setTitle]       = useState('');
  const [date,  setDate]        = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;
    onAdd({ Title: title.trim(), Date: date.trim() });
    setTitle(''); setDate(''); setOpen(false);
  };

  return (
    <div className="space-y-2">
      <ListBoxArea
        items={items.map((m) => ({
          id: m.Id,
          value: `${m.Title} – ${m.Date}`,
        }))}
        onRemove={(id) => onRemove(id)}
      />

      {!open ? (
        <Card variant="empty_list" className="cursor-pointer" onClick={() => setOpen(true)}>
          <div className="flex justify-center py-4">
            <Button variant="default_sq">
              <PlusIcon size={20} />
            </Button>
          </div>
        </Card>
      ) : (
        <Card variant="default" className="p-4">
          <form onSubmit={handleSubmit} className="space-y-2">
            <Input
              variant="default"
              placeholder="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              variant="default"
              type="date"
              placeholder="AAAA-MM-JJ"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <div className="flex justify-center pt-1">
              <Button variant="default" type="submit">
                <p className={textStyles.defaultWhite}>Ajouter</p>
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
