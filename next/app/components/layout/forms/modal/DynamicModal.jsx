'use client';

import React, { useState, useEffect } from 'react';
import { textStyles } from '@/app/styles/tailwindStyles';
import { XIcon } from '@primer/octicons-react';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import ComboBox from '@/app/components/ui/combobox/ComboBox';
import Input from '@/app/components/ui/Input';
import { ListBox, useListBox } from '@/app/components/ui/listbox';

function formatDate(d) {
  if (!d) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date(d));
}

export default function DynamicModal({
  title,
  fields: initialFields,
  isOpen,
  onClose,
  onSubmit,
  errors = {},
  onClearError,
  apiError,
  clearApiError,
  metadata = {}
}) {
  const initState = () => {
    const s = {};
    initialFields.forEach(f => {
      s[f.label] = f.value;
    });
    return s;
  };
  const [fields, setFields] = useState(initState());

  useEffect(() => {
    if (!isOpen) setFields(initState());
  }, [isOpen, initialFields]);

  const change = (l, v) => {
    setFields(p => ({ ...p, [l]: v }));
    if (apiError) clearApiError();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--popup-color)] flex items-center justify-center z-50">
      {(metadata.createdAt || metadata.updatedAt) && (
        <div className="absolute top-4 right-4">
          <Card variant="info">
            {metadata.createdAt && (
              <p className={`text-sm ${textStyles.default}`}>
                Créé le {formatDate(metadata.createdAt)}
              </p>
            )}
            {metadata.updatedAt && (
              <p className={`text-sm ${textStyles.default}`}>
                Modifié le {formatDate(metadata.updatedAt)}
              </p>
            )}
          </Card>
        </div>
      )}
      <div className="w-[300px]">
        <Card variant="default" className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{title || 'Édition'}</h3>
            <Button variant="action_icon_warn" onClick={onClose}>
              <XIcon size={24} />
            </Button>
          </div>
          <form
            onSubmit={e => {
              e.preventDefault();
              onSubmit(fields);
            }}
            className="space-y-4"
          >
            {initialFields.map(f => {
              const { label, options, render } = f;
              let input;

              if (typeof render === 'function') {
                // cas d'un renderer custom
                input = render(fields[label], v => {
                  change(label, v);
                  onClearError?.(label);
                });
              } else if (options) {
                // cas d'un champ à options : multi (array) ou single
                if (Array.isArray(f.value)) {
                  const AddPanel = () => {
                    const { addItem } = useListBox();
                    return (
                      <ComboBox
                        placeholder={label}
                        options={options}
                        onSelect={addItem}
                        maxVisible={4}
                      />
                    );
                  };

                  input = (
                    <ListBox
                      items={fields[label] || []}
                      onChange={v => {
                        change(label, v);
                        onClearError?.(label);
                      }}
                      AddComponent={AddPanel}
                    />
                  );
                } else {
                  input = (
                    <ComboBox
                      placeholder={label}
                      options={options}
                      onSelect={o => {
                        change(label, o);
                        onClearError?.(label);
                      }}
                      value={fields[label]}
                      maxVisible={6}
                    />
                  );
                }
              } else {
                // ← **fallback** pour un champ texte classique
                input = (
                  <Input
                    variant="default"
                    name={label}
                    placeholder={label}
                    value={fields[label]}
                    onChange={e => {
                      change(label, e.target.value);
                      onClearError?.(label);
                    }}
                  />
                );
              }

              return (
                <div key={label}>
                  <p className={`mb-1 ${textStyles.default}`}>{label}</p>
                  {input}
                  {errors[label] && (
                    <p className={`${textStyles.warn} text-sm mt-1`}>
                      {errors[label]}
                    </p>
                  )}
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
        {apiError && (
          <div className="mt-4">
            <Card variant="warn" className="w-full">
              <div className="flex items-center">
                <p className="flex-1">{apiError}</p>
                <Button
                  variant="cancel_action_sq"
                  onClick={clearApiError}
                  className="ml-2 transition-transform duration-200 hover:scale-110"
                >
                  <XIcon size={20} />
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
