export function Logomark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="14" cy="14" r="11.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M15.5 5.5 10 15h4l-1.5 7.5L18 13h-4l1.5-7.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
