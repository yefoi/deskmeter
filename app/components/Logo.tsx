export default function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M5 22a11 11 0 0 1 22 0"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-acento"
      />
      <path
        d="M16 22l6.5-6.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="16" cy="22" r="2.6" fill="currentColor" />
    </svg>
  );
}
