'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import { 
  IssueClosedIcon, 
  IssueOpenedIcon, 
  XIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  SearchIcon 
} from '@primer/octicons-react';
import { textStyles } from '@/app/styles/tailwindStyles';

const MAX_ITEMS = 8;

function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function highlightMatch(text, query) {
  if (!query) return text;
  const matchIndex = normalizeString(text).indexOf(normalizeString(query));
  if (matchIndex === -1) return text;

  return (
    <>
      {text.substring(0, matchIndex)}
      <strong>{text.substring(matchIndex, matchIndex + query.length)}</strong>
      {text.substring(matchIndex + query.length)}
    </>
  );
}

function ComboBoxOption({ 
  option, 
  onSelect, 
  searchTerm, 
  isHighlighted, 
  isSelected 
}) {
  const optionRef = useRef(null);

  useEffect(() => {
    if (isHighlighted && optionRef.current) {
      optionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isHighlighted]);

  return (
    <div
      ref={optionRef}
      className={`
        p-2 hover:bg-gray-100 cursor-pointer 
        flex justify-between items-center
        group
        ${isHighlighted ? 'bg-gray-100' : ''}
      `}
      onClick={() => onSelect(option)}
    >
      <span>{highlightMatch(option.value, searchTerm)}</span>

      {isSelected ? (
        <IssueClosedIcon className="text-[var(--selected-color)]" />
      ) : (
        <IssueOpenedIcon
          className="
            text-gray-500
            opacity-0 
            group-hover:opacity-100
          "
        />
      )}
    </div>
  );
}

function ComboBoxList({ 
  options, 
  onSelect, 
  searchTerm, 
  highlightedIndex, 
  selectedOption, 
  loadMore 
}) {
  return (
    <div className="max-h-60 overflow-auto" onScroll={loadMore}>
      {options.length > 0 ? (
        options.map((option, index) => (
          <ComboBoxOption
            key={option.id}
            option={option}
            onSelect={onSelect}
            searchTerm={searchTerm}
            isHighlighted={index === highlightedIndex}
            isSelected={option.id === selectedOption?.id}
          />
        ))
      ) : (
        <div className="p-2 text-gray-500">Aucun résultat.</div>
      )}
    </div>
  );
}

function ComboBoxPopover({ 
  isOpen,
  options, 
  onSelect, 
  searchTerm, 
  highlightedIndex, 
  selectedOption, 
  loadMore 
}) {
  return (
    <div
      className={`
        absolute w-full mt-2 bg-white border border-gray-300 
        rounded-lg shadow-lg z-10 overflow-hidden
        transition-all duration-200 transform origin-top
        ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
      `}
    >
      <ComboBoxList
        options={options}
        onSelect={onSelect}
        searchTerm={searchTerm}
        highlightedIndex={highlightedIndex}
        selectedOption={selectedOption}
        loadMore={loadMore}
      />
    </div>
  );
}

export default function ComboBox({ options, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [displayedOptions, setDisplayedOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

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

  useEffect(() => {
    setDisplayedOptions(filteredOptions.slice(0, MAX_ITEMS));
  }, [filteredOptions]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedOption(null);

    const filtered = options.filter(option => 
      normalizeString(option.value).startsWith(normalizeString(value))
    );
    setFilteredOptions(filtered);
    setHighlightedIndex(0);
  };

  const handleSelect = (option) => {
    if (!option) return;
    setSelectedOption(option);
    setSearchTerm(option.value);
    setFilteredOptions(options);
    setDisplayedOptions(options.slice(0, MAX_ITEMS));
    setHighlightedIndex(0);
    setIsOpen(false);
    onSelect(option);
    inputRef.current?.blur();
  };

  const clearSelection = () => {
    setSelectedOption(null);
    setSearchTerm('');
    setFilteredOptions(options);
    setDisplayedOptions(options.slice(0, MAX_ITEMS));
    setHighlightedIndex(0);
    setIsOpen(true);
    onSelect(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e) => {
    if (isOpen) {
      if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        handleSelect(displayedOptions[highlightedIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (highlightedIndex === -1) {
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((prev) => (prev + 1 < displayedOptions.length ? prev + 1 : prev));
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(0);
    }
  };

  const loadMore = useCallback((e) => {
    if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
      setDisplayedOptions(prev => [
        ...prev, 
        ...filteredOptions.slice(prev.length, prev.length + MAX_ITEMS)
      ]);
    }
  }, [filteredOptions]);

  return (
    <div className="relative w-full max-w-xs" ref={comboBoxRef}>
      <Input
        ref={inputRef}
        variant={selectedOption ? "selected" : "default"}
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Sélectionner..."
      />
      <Button
        type="button"
        variant={selectedOption ? "popover_selected_sq" : "popover_default_sq"}
        onClick={(e) => {
          e.preventDefault();
          if (selectedOption) {
            clearSelection();
          } else {
            setIsOpen((prev) => {
              const newState = !prev;
              if (newState) {
                setTimeout(() => inputRef.current?.focus(), 0);
              }
              return newState;
            });
          }
        }}
      >
        {selectedOption ? (
          <XIcon size={16} className={textStyles.defaultWhite} />
        ) : isOpen ? (
          <ChevronUpIcon size={16} className={textStyles.defaultWhite} />
        ) : (
          <ChevronDownIcon size={16} className={textStyles.defaultWhite} />
        )}
      </Button>

      <ComboBoxPopover
        isOpen={isOpen}
        options={displayedOptions}
        onSelect={handleSelect}
        searchTerm={searchTerm}
        highlightedIndex={highlightedIndex}
        selectedOption={selectedOption}
        loadMore={loadMore}
      />
    </div>
  );
}
