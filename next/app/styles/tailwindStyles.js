// app/styles/tailwindStyles.js
const buttonStyles = {
  default: "bg-[var(--accent-color)] text-[var(--primary-color)] font-bold py-2 px-4 rounded-[12.5px]",
  warn: "bg-[var(--warn-color)] text-[var(--primary-color)] font-bold py-2 px-4 rounded-[12.5px]",
  loading: "bg-[var(--accent-color)] text-[var(--primary-color)] font-bold py-2 px-4 rounded-[12.5px]",
  outline: "bg-[var(--primary-color)] text-[var(--secondary-color)] border-[0.5px] font-bold py-2 px-4 rounded-[12.5px] border-[var(--hint-color)]",
};

const cardStyles = {
  default: "bg-[var(--primary-color)] text-[var(--secondary-color)] p-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)] rounded-[12.5px]",
};

const inputStyles = {
  default:
    "text-[var(--secondary-color)] border-[1px] border-[var(--accent-color)] py-2 px-4 rounded-[12.5px] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]",
  selected:
    "text-[var(--secondary-color)] border-[1px] border-[var(--selected-color)] py-2 px-4 rounded-[12.5px] focus:outline-none focus:ring-1 focus:ring-[var(--selected-color)] shadow-inner shadow-[inset_0_0_6px_var(--selected-color)]",
  warn:
    "text-[var(--secondary-color)] border-[1px] border-[var(--warn-color)] py-2 px-4 rounded-[12.5px] focus:outline-none focus:ring-1 focus:ring-[var(--warn-color)] shadow-inner shadow-[inset_0_0_6px_var(--warn-color)]",    
  disabled:
    "bg-[var(--hint-color)] border-[1.5px] border-[var(--hint-color)] cursor-not-allowed py-2 px-4 rounded-[12.5px]",
};

const spinnerStyles = {
  default: "inline-block h-8 w-8 animate-[spinner-grow_0.75s_linear_infinite] rounded-full bg-current align-[-0.125em] opacity-50 motion-reduce:animate-[spinner-grow_1.5s_linear_infinite]"
};

const textStyles = {
  default: "text-[var(--secondary-color)]",
  defaultWhite: "text-[var(--primary-color)]",
  bold: "text-[var(--secondary-color)] font-bold",
  boldWhite: "text-[var(--primary-color)] font-bold",
  hint: "text-[var(--hint-color)]",
  warn: "text-[var(--warn-color)]",
};

export { buttonStyles, cardStyles, inputStyles, spinnerStyles, textStyles };
