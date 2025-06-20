'use client';

import ComboBox from '@/app/components/ui/combobox/ComboBox';
import ListBox from '@/app/components/ui/listbox/ListBox';
import Input from '@/app/components/ui/Input';

export default function FieldRenderer({ field, value, onChange }) {
  const { name, options, render, placeholder = name } = field;

  if (render) return render(value, v => onChange(name, v));

  if (options) {
    if (Array.isArray(value)) {
      return (
        <ListBox
          items={value}
          onChange={v => onChange(name, v)}
          AddComponent={() => (
            <ComboBox
              placeholder={placeholder}
              options={options}
              onSelect={item => onChange(name, [...value, item])}
            />
          )}
        />
      );
    }

    return (
      <ComboBox
        placeholder={placeholder}
        options={options}
        value={value}
        onSelect={o => onChange(name, o)}
      />
    );
  }

  return (
    <Input
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={e => onChange(name, e.target.value)}
    />
  );
}
