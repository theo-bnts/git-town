
'use client';

import { useState, useEffect } from 'react';

import { XIcon } from '@primer/octicons-react';

import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import ComboBox from '@/app/components/ui/combobox/ComboBox';
import ListBox from '@/app/components/ui/listbox/ListBox';
import Input from '@/app/components/ui/Input';

import { MetadataCard } from '@/app/components/ui/modal/MetadataCard';
import { FieldWrapper } from '@/app/components/ui/modal/FieldWrapper';

import { textStyles } from "@/app/styles/tailwindStyles";

export default function FormModal({
    formKey,
    isOpen,
    title = 'Édition',
    fields,
    errors = {},
    apiError,
    onClearApiError,
    onClose,
    onSubmit,
    metadata = {},
  }) {
    const initValues = () =>
      fields.reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {});
  
    const [values, setValues] = useState(initValues());
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    useEffect(() => {
      if (isOpen) setValues(initValues());
      setIsSubmitting(false);
    }, [isOpen, fields]);
  
    const change = (name, value) => {
      setValues(v => ({ ...v, [name]: value }));
      if (apiError) onClearApiError();
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-[var(--popup-color)] flex items-center justify-center z-50">
        <MetadataCard {...metadata} />
  
        <div key={formKey} className="w-[300px] relative">
          <Card variant="default" className="relative p-6">
            <header className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{title}</h3>
              <Button variant="action_icon_warn" onClick={onClose}>
                <XIcon size={24} />
              </Button>
            </header>
  
            <form
              className="space-y-4"
              onSubmit={async e => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  try {
                    await onSubmit(values);
                  } finally {
                    setIsSubmitting(false);
                  }
              }}
            >
              {fields.map(({ name, options, render }) => (
                <FieldWrapper key={name} label={name} error={errors[name]}>
                  {render ? (
                    render(values[name], v => change(name, v))
                  ) : options ? (
                    Array.isArray(values[name]) ? (
                      <ListBox
                        items={values[name]}
                        onChange={v => change(name, v)}
                        AddComponent={() => (
                          <ComboBox
                            placeholder={name}
                            options={options}
                            onSelect={item =>
                              change(name, [...values[name], item])
                            }
                          />
                        )}
                      />
                    ) : (
                      <ComboBox
                        placeholder={name}
                        options={options}
                        value={values[name]}
                        onSelect={o => change(name, o)}
                      />
                    )
                  ) : (
                    <Input
                      placeholder={name}
                      name={name}
                      value={values[name]}
                      onChange={e => change(name, e.target.value)}
                    />
                  )}
                </FieldWrapper>
              ))}
  
              <div className="flex justify-center pt-2">
              <Button
                variant="default"
                type="submit"
                loading={isSubmitting}
                >
                  <span className={textStyles.defaultWhite}>
                    {isSubmitting ? 'Enregistrement' : 'Enregistrer'}
                  </span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }
