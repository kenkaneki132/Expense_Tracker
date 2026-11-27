// Small stroke icon set (24x24, currentColor).
const PATHS = {
  receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3z M9 8h6 M9 12h6 M9 16h3',
  plus: 'M12 5v14 M5 12h14',
  pencil: 'M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z M13.5 6.5l4 4',
  trash: 'M4 7h16 M9 7V4h6v3 M6.5 7l1 13h9l1-13 M10 11v5 M14 11v5',
  download: 'M12 4v11 M7 10l5 5 5-5 M5 20h14',
  sort: 'M8 9l4-4 4 4 M8 15l4 4 4-4',
  up: 'M12 19V5 M6 11l6-6 6 6',
  down: 'M12 5v14 M6 13l6 6 6-6',
  alert: 'M12 3.5l9.5 17h-19L12 3.5z M12 10v4.5 M12 17.6v.01',
  sparkles: 'M11 3l1.7 4.8L17.5 9.5l-4.8 1.7L11 16l-1.7-4.8L4.5 9.5l4.8-1.7L11 3z M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z',
  inbox: 'M3 13l3-8h12l3 8v6H3v-6z M3 13h5l1 2h6l1-2h5',
  x: 'M6 6l12 12 M18 6L6 18',
  save: 'M5 12.5l4.5 4.5L19 7.5',
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, size = 18, strokeWidth = 1.9 }: { name: IconName; size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none' }}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
