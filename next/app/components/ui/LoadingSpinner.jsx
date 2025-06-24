'use client';

export default function LoadingSpinner({ size = 32 }) {
  /* cercle animé en Tailwind */
  return (
    <span
      style={{ width: size, height: size }}
      className="
        block rounded-full border-4
        border-[var(--accent-color)] border-t-transparent
        animate-spin
      "
    />
  );
}
