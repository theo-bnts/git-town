'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/app/components/ui/Button';
import { MetadataCard } from '@/app/components/ui/modal/MetadataCard';
import { FieldWrapper } from '@/app/components/ui/modal/FieldWrapper';
import ModalBase from '@/app/components/ui/modal/ModalBase';
import { textStyles } from '@/app/styles/tailwindStyles';
import FieldRenderer from '@/app/components/ui/modal/FieldRenderer';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

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
  isLoading = false,
  disableSubmit = false,
}) {
  const computeInitValues = () =>
    fields.reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {});

  const [values, setValues] = useState(computeInitValues());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues(computeInitValues());
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const wasLoading = useRef(false);
  useEffect(() => {
    if (isOpen && wasLoading.current && !isLoading) {
      setValues(computeInitValues());
    }
    wasLoading.current = isLoading;
  }, [isLoading, isOpen]);

  const change = (name, value) => {
    setValues(v => ({ ...v, [name]: value }));
    if (apiError) onClearApiError();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <MetadataCard {...metadata} />

      <ModalBase
        isOpen={isOpen}
        title={title}
        onClose={onClose}
        footer={
          isLoading ? null : (
            <div className="flex justify-center">
              <Button
                variant={disableSubmit ? 'disabled' : 'default'}
                type="submit"
                form={formKey}
                loading={isSubmitting}
                disabled={disableSubmit}
              >
                <span className={textStyles.defaultWhite}>
                  {isSubmitting ? 'Enregistrement' : 'Enregistrer'}
                </span>
              </Button>
            </div>
          )
        }
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size={40} />
          </div>
        ) : (
          <form id={formKey} className="space-y-4" onSubmit={handleSubmit}>
            {fields.map(field => (
              <FieldWrapper
                key={field.name}
                label={field.name}
                error={errors[field.name]}
              >
                <FieldRenderer
                  field={field}
                  value={values[field.name]}
                  onChange={change}
                />
              </FieldWrapper>
            ))}
          </form>
        )}
      </ModalBase>
    </>
  );
}
