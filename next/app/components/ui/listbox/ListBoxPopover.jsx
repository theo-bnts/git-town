import React, { useEffect, useRef } from 'react';
import ComboBox from '@/app/components/ui/combobox/ComboBox';

export default function ListBoxPopover({ isOpen, options, onSelect, onClose, maxVisible = 4, toggleButtonRef }) {
  const popoverRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        (popoverRef.current && popoverRef.current.contains(event.target)) ||
        (toggleButtonRef?.current && toggleButtonRef.current.contains(event.target))
      ) {
        return;
      }
      if (isOpen && onClose) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, toggleButtonRef]);

  return (
    <div
      ref={popoverRef}
      className={`
        absolute left-0 top-full mt-2 w-full bg-gray-100 border border-gray-300 
        rounded-[14px] shadow-lg z-10 overflow-visible
        transition-all duration-200 transform origin-top
        ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
      `}
    >
      <ComboBox
        placeholder="Sélectionnez un élément"
        options={options}
        onSelect={onSelect}
        maxVisible={maxVisible}
        autoOpen={isOpen}  // Ajout de la prop autoOpen
      />
    </div>
  );
}
