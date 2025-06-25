// app/styles/tailwindStyles.js
const textStyles = {
  default: `text-[var(--secondary-color)]`,
  defaultWhite: `text-[var(--primary-color)]`,
  bold: `text-[var(--secondary-color)] font-bold`,
  boldWhite: `text-[var(--primary-color)] font-bold`,
  hint: `text-[var(--hint-color)]`,
  warn: `text-[var(--warn-color)]`,
  selected: `text-[var(--accent-color)]`,
  url: `underline underline-offset-4 decoration-dotted decoration-gray-400 transition-transform duration-200 hover:scale-105 hover:text-[var(--accent-color)]`,
  sectionTitle: "text-lg font-bold leading-none",
  subtle: "text-center text-sm text-gray-600",
  verySubtle: "text-center text-xs text-gray-500",
  warning: "text-sm text-yellow-700",
  alertTitle: "font-medium text-[var(--secondary-color)] text-base",
  alertText: "text-sm text-[var(--hint-color)]",
  alertLink: "text-sm text-[var(--accent-color)] cursor-pointer hover:text-[var(--accent-color-hover)] font-medium",
};

const buttonStyles = {
  default: `bg-[var(--accent-color)] py-2 px-4 rounded-[12.5px] hover:bg-[var(--accent-color-hover)] transition-colors duration-200`,
  warn: `bg-[var(--warn-color)] py-2 px-4 rounded-[12.5px] hover:bg-[var(--warn-color-hover)] transition-colors duration-200`,
  loading: `bg-[var(--accent-color)] py-2 px-4 rounded-[12.5px]`,
  outline: `bg-[var(--primary-color)] border-[0.5px] py-2 px-4 rounded-[12.5px] border-[var(--hint-color)] hover:bg-[var(--primary-color-hover)] transition-colors duration-200`,
  disabled: `bg-[var(--hint-color)] cursor-not-allowed py-2 px-4 rounded-[12.5px]`,
  
  outline_full: `w-full flex items-center justify-center bg-[var(--primary-color)] border-[0.5px] py-2 px-4 rounded-[12.5px] border-[var(--hint-color)] hover:bg-[var(--primary-color-hover)] transition-colors duration-200`,

  action_icon_warn: `transition-colors duration-200 hover:scale-125 hover:text-[var(--warn-color-hover)]`,
  action_icon: `transition-colors duration-200 hover:scale-125 hover:text-[var(--accent-color)]`,
  
  action_sq: `flex items-center justify-center p-2 transition-transform duration-200 hover:scale-125 hover:text-[var(--accent-color)]`,
  action_sq_warn: `flex items-center justify-center p-2 transition-transform duration-200 hover:scale-125 hover:text-[var(--warn-color)]`,
  action_sq_disabled: `flex items-center justify-center p-2 cursor-not-allowed text-[var(--hint-color)]`,
  default_sq: `bg-[var(--accent-color)] p-2 rounded-[12.5px] hover:bg-[var(--accent-color-hover)] transition-colors duration-200`,
  
  popover_default_sq: `flex items-center p-2 bg-[var(--accent-color)] rounded-r-[12.5px]`,
  popover_selected_sq: `flex items-center p-2 bg-[var(--selected-color)] rounded-r-[12.5px]`,
  action_icon_refresh: `flex items-center space-x-1 bg-white hover:bg-[var(--primary-color-hover)] text-[var(--accent-color)] px-3 py-2 rounded-md border border-[var(--accent-color)] transition-colors duration-200`,
};

const cardStyles = {
  default: `bg-[var(--primary-color)] p-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)] rounded-[12.5px]`,
  navbar: `bg-[var(--primary-color)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)] rounded-[12.5px]`,
  navbar_unselected: `bg-[var(--primary-color)] rounded-[12.5px]`,
  info: `bg-[var(--primary-color)] text-[var(--popup-color)] p-4 rounded-[12.5px] shadow-md`,
  warn: `bg-[var(--warn-color)] p-4 rounded-[12.5px] shadow-lg text-[var(--primary-color)]`,
  empty_list: `bg-[var(--primary-color)] p-2 rounded-[12.5px] border border-[var(--primary-color)]`,
  success: `bg-[var(--accent-color)] p-4 rounded-[12.5px] shadow-lg text-[var(--primary-color)]`,
  empty: "bg-gray-50 p-4 rounded-lg text-center",
  contributionCard: "rounded-lg border border-gray-200 bg-white p-4 shadow-sm",
  partialData: `bg-white border-l-4 border-[var(--accent-color)] p-4 rounded-lg shadow-md`,
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

const tagStyles = {
  default: 'px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800',
  success: 'px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800',
  warning: 'px-2 py-1 text-xs font-medium rounded-md bg-yellow-100 text-yellow-800',
  danger: 'px-2 py-1 text-xs font-medium rounded-md bg-red-100 text-red-800',
  info: 'px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800',
  accent: 'px-2 py-1 text-xs font-medium rounded-md bg-[var(--accent-color-light)] text-[var(--accent-color-dark)]',
  selected: 'px-2 py-1 text-xs font-medium rounded-md bg-[rgba(86,86,228,0.15)] text-[var(--selected-color)]',
};

const modalStyles = {
  overlay: "fixed inset-0 bg-[var(--popup-color)] flex items-center justify-center z-50 overflow-hidden",
  container: "w-full h-full overflow-y-auto py-6 lg:py-8 2xl:py-4",
  content: "w-full max-w-[95vw] 2xl:max-w-[75vw] mx-auto px-2 lg:px-4",
  grid: "grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6",
  fullWidth: "w-full"
};

const tooltipStyles = {
  default: `bg-white border border-gray-200 shadow-sm p-2 rounded-md`,
};

export { 
  buttonStyles, 
  cardStyles, 
  comboboxStyles, 
  inputStyles, 
  listboxStyles, 
  spinnerStyles, 
  textStyles,
  modalStyles,
  tagStyles,
  tooltipStyles 
 };
