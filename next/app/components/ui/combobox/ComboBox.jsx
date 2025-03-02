'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDownIcon, ChevronUpIcon, SearchIcon, XIcon } from '@primer/octicons-react';

import { textStyles, comboboxStyles } from '@/app/styles/tailwindStyles';
import { normalizeString } from '@/app/utils/stringUtils';

import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import ComboBoxPopover from '@/app/components/ui/combobox/ComboBoxPopover';

const MAX_ITEMS = 8; // Nombre de lignes chargées à la fois.

export default function ComboBox({ placeholder, options, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [displayedOptions, setDisplayedOptions] = useState([]);
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setDisplayedOptions(filteredOptions.slice(0, MAX_ITEMS));
  }, [filteredOptions]);

  const ensureSelectedOptionVisible = (option) => {
    if (!option) {
      setHighlightedIndex(-1);
      return;
    }
    const idx = filteredOptions.findIndex((o) => o.id === option.id);
    if (idx < 0) {
      setHighlightedIndex(-1);
      return;
    }

    let newDisplayed = [...displayedOptions];
    while (idx >= newDisplayed.length) {
      const nextSlice = filteredOptions.slice(
        newDisplayed.length,
        newDisplayed.length + MAX_ITEMS
      );
      if (nextSlice.length === 0) {
        break;
      }
      newDisplayed = [...newDisplayed, ...nextSlice];
    }
    setDisplayedOptions(newDisplayed);
    setHighlightedIndex(idx);
  };

  const handleOpenPopover = () => {
    setIsOpen(true);
    if (selectedOption) {
      ensureSelectedOptionVisible(selectedOption);
    } else {
      setHighlightedIndex(-1);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedOption(null);
    onSelect?.(null);
    const filtered = options.filter((option) =>
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
    setHighlightedIndex(-1);
    setIsOpen(true);
    onSelect?.(null);
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
        setHighlightedIndex((prev) =>
          prev === -1 ? 0 : Math.min(prev + 1, displayedOptions.length - 1)
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleOpenPopover();
    }
  };

  const loadMore = useCallback(
    (e) => {
      if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
        setDisplayedOptions((prev) => [
          ...prev,
          ...filteredOptions.slice(prev.length, prev.length + MAX_ITEMS),
        ]);
      }
    },
    [filteredOptions]
  );

  return (
    <div
      ref={comboBoxRef}
      className={selectedOption ? comboboxStyles.selected : comboboxStyles.default}
    >
      <div className="flex items-center">
        <Input
          ref={inputRef}
          variant={selectedOption ? 'selected' : 'default'}
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleOpenPopover}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          leftIcon={
            <SearchIcon
              size={16}
              className={selectedOption ? textStyles.default : textStyles.hint}
            />
          }
        />

        <Button
          type="button"
          variant={selectedOption ? 'popover_selected_sq' : 'popover_default_sq'}
          onClick={(e) => {
            e.preventDefault();
            if (selectedOption) {
              clearSelection();
            } else {
              setIsOpen((prev) => {
                const newState = !prev;
                if (newState) {
                  setTimeout(() => {
                    inputRef.current?.focus();
                    handleOpenPopover();
                  }, 0);
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
      </div>

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
