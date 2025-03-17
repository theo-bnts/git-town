'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import ComboBox from '@/app/components/ui/combobox/ComboBox';
import ListBox from '@/app/components/ui/listbox/ListBox';
import { XIcon } from '@primer/octicons-react';
import { textStyles } from '@/app/styles/tailwindStyles';

export default function DynamicModal({ title, fields: initialFields, isOpen, onClose, onSubmit }) {
  const getInitialState = () => {
    const state = {};
    initialFields.forEach(field => {
      state[field.label] = field.value;
    });
    return state;
  };

  const [fields, setFields] = useState(getInitialState());

  useEffect(() => {
    if (!isOpen) {
      setFields(getInitialState());
    }
  }, [isOpen, initialFields]);

  const handleChange = (label, newValue) => {
    setFields(prev => ({ ...prev, [label]: newValue }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(fields);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--popup-color)] flex items-center justify-center z-50">
      <Card variant="default" className="relative w-[400px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{title || "Édition"}</h3>
          <Button variant="action_sq" onClick={onClose}>
            <XIcon size={24} />
          </Button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {initialFields.map(field => {
            const { label, value, options } = field;
            let inputComponent = null;

            if (options) {
              if (typeof value === 'string' || typeof value === 'object' && !Array.isArray(value)) {
                const mappedOptions = options.map((item, idx) => {
                  if (Array.isArray(item)) {
                    return {
                      id: item[0] !== undefined ? item[0] : idx,
                      value: item[1] !== undefined ? item[1] : item[0]
                    };
                  }
                  return { id: idx, value: item };
                });
                inputComponent = (
                  <ComboBox
                    placeholder={label}
                    options={mappedOptions}
                    onSelect={(option) => handleChange(label, option)}
                    value={fields[label]}
                    maxVisible={6}
                  />
                );
              }
              else if (Array.isArray(value)) {
                const mappedOptions = options.map((row, idx) => ({
                  id: row[0] !== undefined ? row[0] : idx,
                  value: row[1] !== undefined ? row[1] : row.join(' - ')
                }));
                inputComponent = (
                  <ListBox
                    placeholder={label}
                    options={mappedOptions}
                    selected={fields[label] || []}
                    onChange={(selectedOptions) => handleChange(label, selectedOptions)}
                  />
                );
              }
            } else {
              inputComponent = (
                <Input
                  variant="default"
                  name={label}
                  placeholder={label}
                  value={fields[label]}
                  onChange={(e) => handleChange(label, e.target.value)}
                />
              );
            }

            return (
              <div key={label}>
                <p className={`mb-1 ${textStyles.default}`}>{label}</p>
                {inputComponent}
              </div>
            );
          })}

          <div className="flex justify-center pt-2">
            <Button variant="default" type="submit">
              <p className={textStyles.defaultWhite}>Enregistrer</p>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}