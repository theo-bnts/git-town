// app/styles/tailwindStyles.js
const textStyles = {
  default: `text-[var(--secondary-color)]`,
  defaultWhite: `text-[var(--primary-color)]`,
  bold: `text-[var(--secondary-color)] font-bold`,
  boldWhite: `text-[var(--primary-color)] font-bold`,
  hint: `text-[var(--hint-color)]`,
  warn: `text-[var(--warn-color)]`,
  url: `underline underline-offset-4 decoration-dotted decoration-gray-400 transition-transform duration-200 hover:scale-105 hover:text-[var(--accent-color)]`
};

const buttonStyles = {
  default: `bg-[var(--accent-color)] py-2 px-4 rounded-[12.5px] hover:bg-[var(--accent-color-hover)] transition-colors duration-200`,
  warn: `bg-[var(--warn-color)] py-2 px-4 rounded-[12.5px] hover:bg-[var(--warn-color-hover)] transition-colors duration-200`,
  loading: `bg-[var(--accent-color)] py-2 px-4 rounded-[12.5px]`,
  outline: `bg-[var(--primary-color)] border-[0.5px] py-2 px-4 rounded-[12.5px] border-[var(--hint-color)] hover:bg-[var(--primary-color-hover)] transition-colors duration-200`,
  
  outline_full: `w-full flex items-center justify-center bg-[var(--primary-color)] border-[0.5px] py-2 px-4 rounded-[12.5px] border-[var(--hint-color)] hover:bg-[var(--primary-color-hover)] transition-colors duration-200`,

  action_sq_warn: `flex items-center justify-center transition-colors duration-200 hover:scale-110 hover:text-[var(--warn-color-hover)]`,
  
  action_sq: `flex items-center justify-center p-2 transition-transform duration-200 hover:scale-110 hover:text-[var(--accent-color)]`,
  default_sq: `bg-[var(--accent-color)] p-2 rounded-[12.5px] hover:bg-[var(--accent-color-hover)] transition-colors duration-200`,
    
  popover_default_sq: `flex items-center p-2 bg-[var(--accent-color)] rounded-r-[12.5px]`,
  popover_selected_sq: `flex items-center p-2 bg-[var(--selected-color)] rounded-r-[12.5px]`,
};

const cardStyles = {
  default: `bg-[var(--primary-color)] p-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)] rounded-[12.5px]`,
  info: `bg-[var(--primary-color)] text-[var(--popup-color)] p-4 rounded-[12.5px] shadow-md`,
  warn: `bg-[var(--warn-color)] p-4 rounded-[12.5px] shadow-lg text-[var(--primary-color)]`,
  empty_list: `bg-[var(--primary-color)] p-2 rounded-[12.5px] border border-[var(--primary-color)]`,
};

const inputStyles = {
  default: `border-[1px] border-[var(--accent-color)] py-2 px-4 rounded-[12.5px] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]`,
  selected: `border-[1px] border-[var(--selected-color)] py-2 px-4 rounded-[12.5px] focus:outline-none focus:ring-1 focus:ring-[var(--selected-color)] shadow-inner shadow-[inset_0_0_6px_var(--selected-color)]`,
  warn: `border-[1px] border-[var(--warn-color)] py-2 px-4 rounded-[12.5px] focus:outline-none focus:ring-1 focus:ring-[var(--warn-color)] shadow-inner shadow-[inset_0_0_6px_var(--warn-color)]`,    
  disabled: `bg-[var(--hint-color)] border-[1.5px] border-[var(--hint-color)] cursor-not-allowed py-2 px-4 rounded-[12.5px]`,
};

const spinnerStyles = {
  default: `inline-block h-8 w-8 animate-[spinner-grow_0.75s_linear_infinite] rounded-full bg-current align-[-0.125em] opacity-50 motion-reduce:animate-[spinner-grow_1.5s_linear_infinite]`
};

const comboboxStyles = {
  default: `relative w-full max-w-xs rounded-[12.5px] focus-within:outline-none focus-within:ring-1 focus-within:ring-[var(--accent-color)] bg-[var(--accent-color)]`,
  selected: `relative w-full max-w-xs rounded-[12.5px] focus-within:outline-none focus-within:ring-1 focus-within:ring-[var(--selected-color)] bg-[var(--selected-color)]`,
};

const listboxStyles = {
  default: `border-[1px] border-[var(--accent-color)] p-2 rounded-[12.5px] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]`,
};

export { buttonStyles, cardStyles, comboboxStyles, inputStyles, listboxStyles, spinnerStyles, textStyles };
