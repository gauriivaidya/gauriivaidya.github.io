// Minimal 24px stroke icons (inline SVG, no icon font).
const P: Record<string, string> = {
  mail: "M4 6h16v12H4z M4 7l8 6 8-6",
  calendar: "M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4",
  scholar: "M2 9l10-5 10 5-10 5z M6 11v5c3 2.5 9 2.5 12 0v-5",
  orcid: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M9 8v8 M12.5 8h1.5a4 4 0 0 1 0 8h-1.5z",
  github: "M9 19c-4 1.3-4-2-6-2.5 M15 21v-3.5a3 3 0 0 0-.9-2.4c3-.3 6-1.5 6-6.6a5.2 5.2 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6s-1.1-.3-3.6 1.4a12.4 12.4 0 0 0-6.5 0C5.9 1 4.8 1.3 4.8 1.3a4.8 4.8 0 0 0-.1 3.6A5.2 5.2 0 0 0 3.3 8.5c0 5.1 3 6.3 6 6.6a3 3 0 0 0-.9 2.4V21",
  linkedin: "M4 4h16v16H4z M8 10v6 M8 7.5v.01 M12 16v-6 M12 12.5a2.5 2.5 0 0 1 5 0V16",
  file: "M6 3h8l4 4v14H6z M14 3v4h4 M9 12h6 M9 16h6",
};
export function Icon({ name }: { name: keyof typeof P | string }) {
  return (
    <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[name]} />
    </svg>
  );
}
