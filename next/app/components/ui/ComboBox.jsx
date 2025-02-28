'use client';

import React, { useState, useRef, useEffect } from 'react';
import Input from '@/app/components/ui/Input';
import { IssueClosedIcon, XIcon, ChevronDownIcon } from '@primer/octicons-react';

function normalizeString(str) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function highlightMatch(text, query) {
  if (!query) return text;
  const normalizedText = text.normalize("NFD");
  const normalizedQuery = query.normalize("NFD");
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

function ComboBoxOption({ option, onSelect, searchTerm, isHighlighted, isSelected }) {
  return (
    <div
      className={`p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center ${isHighlighted ? 'bg-gray-100' : ''}`}
      onClick={() => onSelect(option)}
    >
      <span>{highlightMatch(option, searchTerm)}</span>
      {isSelected && <IssueClosedIcon className="text-green-600" />}
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
          />
        ))
      ) : (
        <div className="p-2 text-gray-500">Aucun résultat</div>
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
        variant="default"
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Sélectionnez une option..."
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }}
      >
        {searchTerm ? <XIcon size={16} onClick={clearSelection} /> : <ChevronDownIcon size={16} />}
      </button>
      {isOpen && (
        <ComboBoxPopover options={filteredOptions} onSelect={handleSelect} searchTerm={searchTerm} highlightedIndex={highlightedIndex} selectedOption={selectedOption} />
      )}
    </div>
  );
}
