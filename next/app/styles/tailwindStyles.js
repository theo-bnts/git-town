// app/styles/tailwindStyles.js
const buttonStyles = {
  default: "bg-[var(--accent-color)] text-[var(--primary-color)] font-bold py-2 px-4 rounded-[12.5px]",
  warn: "bg-[var(--warn-color)] text-[var(--primary-color)] font-bold py-2 px-4 rounded-[12.5px]",
  outline: "bg-[var(--primary-color)] text-[var(--secondary-color)] border-[0.5px] font-bold py-2 px-4 rounded-[12.5px] border-[var(--hint-color)] ",
};

const inputStyles = {
  default:
    "text-[var(--secondary-color)] border-[0.5px] border-[var(--accent-color)] py-2 px-4 rounded-[12.5px] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]",
  disabled:
    "bg-[var(--primary-color)] text-[var(--hint-color)] border-[0.5px] border-[var(--hint-color)] cursor-not-allowed py-2 px-4 rounded-[12.5px]",
};

const cardStyles = {
  default: "bg-[var(--primary-color)] text-[var(--secondary-color)] p-6 drop-shadow-[0_2px_15px_rgba(0,0,0,0.2)] rounded-[12.5px]",
};

const textStyles = {
  default: "text-[var(--secondary-color)]",
  defaultWhite: "text-[var(--primary-color)]",

  bold: "text-[var(--secondary-color)] font-bold",
  boldWhite: "text-[var(--primary-color)] font-bold",

  hint: "text-[var(--hint-color)]",
};

export { buttonStyles, inputStyles, cardStyles, textStyles };
