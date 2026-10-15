import { createSvgIcon } from '@mui/material/SvgIcon';

const DRAWN_STROKE = 2;

export const CrownGlyph = createSvgIcon(
  <path
    d="M3.5 19h17M5 16 3.5 7.5 8 11l4-7 4 7 4.5-3.5L19 16z"
    fill="none"
    stroke="currentColor"
    strokeWidth={DRAWN_STROKE}
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  'KkCrownGlyph',
);

export const DrumGlyph = createSvgIcon(
  <path
    d="M5 9.5c0-1.4 3.1-2.5 7-2.5s7 1.1 7 2.5-3.1 2.5-7 2.5-7-1.1-7-2.5zM5 9.5v7c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-7M5 13.5l3.5 2.5 3.5-2.5 3.5 2.5 3.5-2.5M10 7 6.5 3M14 7l3.5-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={DRAWN_STROKE}
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  'KkDrumGlyph',
);
