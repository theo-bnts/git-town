// /app/styles/tailwindStyles.js
const buttonStyles = {
  default: "bg-[var(--accent-color)] text-[var(--primary-color)] font-bold py-2 px-4 rounded hover:bg-opacity-80",
  warn: "bg-[var(--warn-color)] text-[var(--primary-color)] font-bold py-2 px-4 rounded hover:bg-opacity-80",
  outline: "border-[0.5px] border-[var(--hint-color)] bg-[var(--primary-color)] text-[var(--secondary-color)] font-bold py-2 px-4 rounded hover:bg-opacity-80",
};

const inputStyles = {
  default: "border-[0.5px] border-[var(--accent-color)] placeholder-[var(--hint-color)] text-[var(--secondary-color)] py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]",
};

const cardStyles = {
  default: "bg-[var(--primary-color)] text-[var(--secondary-color)] p-3 rounded-[12.5px] drop-shadow-[0_2px_15px_rgba(0,0,0,0.2)]",
};

const textStyles = {
  default: "text-[var(--secondary-color)]",
  bold: "text-[var(--secondary-color)] font-bold",
  hint: "text-[var(--hint-color)]",

  defaultWhite: "text-[var(--primary-color)]",
  boldWhite: "text-[var(--primary-color)] font-bold",
};

export { buttonStyles, inputStyles, cardStyles, textStyles };
