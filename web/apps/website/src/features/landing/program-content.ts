import type { Theme } from '@mui/material/styles';

export interface ProgramEvent {
  startsAt: string;
  title: string;
  venue: string;
}

export const PROGRAM_EVENTS: ProgramEvent[] = [
  { startsAt: '2026-02-14T19:11', title: 'Große Prunksitzung', venue: 'Festhalle' },
  { startsAt: '2026-02-08T14:30', title: 'Kinderfasching', venue: 'Sporthalle' },
  { startsAt: '2026-02-16T13:11', title: 'Rosenmontagsumzug', venue: 'Dorfplatz' },
];

const MONTH_ABBREVIATIONS = [
  'JAN',
  'FEB',
  'MÄR',
  'APR',
  'MAI',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OKT',
  'NOV',
  'DEZ',
] as const;

export interface EventDisplay {
  day: string;
  month: string;
  time: string;
}

export const resolveEventTint = (theme: Theme, index: number): string => {
  const palette = (theme.vars ?? theme).palette;
  if (index === 0) {
    return palette.primary.main;
  }
  if (index === 1) {
    return palette.warning.main;
  }
  return palette.text.primary;
};

export const deriveEventDisplay = (startsAt: string): EventDisplay => {
  const [datePart = '', timePart = ''] = startsAt.split('T');
  const [, month = '', day = ''] = datePart.split('-');
  const [hours = '', minutes = ''] = timePart.split(':');

  return {
    day,
    month: MONTH_ABBREVIATIONS[Number(month) - 1] ?? '',
    time: `${hours}:${minutes} Uhr`,
  };
};
