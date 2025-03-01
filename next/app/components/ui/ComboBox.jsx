'use client';

import React, { useState, useRef, useEffect } from 'react';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import { IssueClosedIcon, XIcon, ChevronDownIcon, ChevronUpIcon } from '@primer/octicons-react';
import { textStyles } from '@/app/styles/tailwindStyles';

function normalizeString(str) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function highlightMatch(text, query) {
  if (!query) return text;
  let matchIndex = normalizeString(text).indexOf(normalizeString(query));
  if (matchIndex === -1) return text;
  
  return (
    <>
      {text.substring(0, matchIndex)}
      <strong>{text.substring(matchIndex, matchIndex + query.length)}</strong>
      {text.substring(matchIndex + query.length)}
    </>
  );
}

function ComboBoxOption({ option, onSelect, searchTerm, isHighlighted, isSelected, isFirst, isLast }) {
  return (
    <div
      className={`p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center ${isHighlighted ? 'bg-gray-100' : ''} ${isFirst ? 'rounded-t-lg' : ''} ${isLast ? 'rounded-b-lg' : ''}`}
      onClick={() => onSelect(option)}
    >
      <span>{highlightMatch(option, searchTerm)}</span>
      {isSelected && <IssueClosedIcon className="text-[var(--selected-color)]" />}
    </div>
  );
}

function ComboBoxList({ options, onSelect, searchTerm, highlightedIndex, selectedOption }) {
  return (
    <div className="max-h-60 overflow-auto">
      {options.length > 0 ? (
        options.map((option, index) => (
          <ComboBoxOption
            key={index}
            option={option}
            onSelect={onSelect}
            searchTerm={searchTerm}
            isHighlighted={index === highlightedIndex}
            isSelected={option === selectedOption}
            isFirst={index === 0}
            isLast={index === options.length - 1}
          />
        ))
      ) : (
        <div className="p-2 text-gray-500">Aucun résultat.</div>
      )}
    </div>
  );
}

function ComboBoxPopover({ options, onSelect, searchTerm, highlightedIndex, selectedOption }) {
  return (
    <div className="absolute w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
      <ComboBoxList options={options} onSelect={onSelect} searchTerm={searchTerm} highlightedIndex={highlightedIndex} selectedOption={selectedOption} />
    </div>
  );
}

export default function ComboBox({ options, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [selectedOption, setSelectedOption] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const comboBoxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (comboBoxRef.current && !comboBoxRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedOption(selectedOption);
    if (value === '') {
      clearSelection();
    } else {
      setFilteredOptions(
        options.filter(option => normalizeString(option).startsWith(normalizeString(value)))
      );
    }
  };

  const handleSelect = (option) => {
    setSelectedOption(option);
    setSearchTerm(option);
    setFilteredOptions(options);
    setIsOpen(false);
    onSelect(option);
    inputRef.current?.blur();
  };

  const clearSelection = () => {
    setSelectedOption(null);
    setSearchTerm('');
    setFilteredOptions(options);
    setIsOpen(true);
    onSelect(null);
  };

  const handleKeyDown = (e) => {
    if (isOpen) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (highlightedIndex === -1) {
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((prev) => (prev + 1 < filteredOptions.length ? prev + 1 : prev));
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    }
  };

  return (
    <div className="relative w-full max-w-xs" ref={comboBoxRef}>
      <Input
        ref={inputRef}
        variant={selectedOption ? "selected" : "default"}
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Votre sélection..."
      />
      <Button
        type="button"
        variant={selectedOption ? "popover_selected_sq" : "popover_default_sq"}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }}
      >
        {selectedOption ? (
          <XIcon size={16} onClick={clearSelection} className={textStyles.defaultWhite} />
        ) : isOpen ? (
          <ChevronUpIcon size={16} className={textStyles.defaultWhite} />
        ) : (
          <ChevronDownIcon size={16} className={textStyles.defaultWhite} />
        )}
      </Button>
      {isOpen && (
        <ComboBoxPopover options={filteredOptions} onSelect={handleSelect} searchTerm={searchTerm} highlightedIndex={highlightedIndex} selectedOption={selectedOption} />
      )}
    </div>
  );
}
