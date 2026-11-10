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

const CHAIN_BEADS = '0.01 3.2';

export const ScepterGlyph = createSvgIcon(
  <g
    fill="none"
    stroke="currentColor"
    strokeWidth={DRAWN_STROKE}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 20l9.6-9.6M11.4 8.2l4.4 4.4M18.3 5.7l1.8-1.8M18.7 4.1l1.3 1.3" />
    <circle cx="16.4" cy="7.6" r="2.6" />
  </g>,
  'KkScepterGlyph',
);

export const JesterCapGlyph = createSvgIcon(
  <g
    fill="none"
    stroke="currentColor"
    strokeWidth={DRAWN_STROKE}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 16C5 11.5 4.5 9 1.8 8.3 5 6.8 8 8 9 11 9 6.5 11 3.6 15.2 3 13.2 4.8 14 8.2 15 11 16 7.8 19 6.8 22.2 8.3 19.5 9 19 11.5 19 16zM4.5 16h15v4h-15z" />
    <circle cx="1.9" cy="10.2" r="1.3" />
    <circle cx="16.6" cy="4.4" r="1.3" />
    <circle cx="22.1" cy="10.2" r="1.3" />
  </g>,
  'KkJesterCapGlyph',
);

export const ChainGlyph = createSvgIcon(
  <g
    fill="none"
    stroke="currentColor"
    strokeWidth={DRAWN_STROKE}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M4.5 3.5c.4 5.5 3.1 9.3 7.5 10.4 4.4-1.1 7.1-4.9 7.5-10.4"
      strokeDasharray={CHAIN_BEADS}
    />
    <circle cx="12" cy="17.8" r="3.6" />
    <circle cx="12" cy="17.8" r="1.1" />
  </g>,
  'KkChainGlyph',
);

export const ViceCrownGlyph = createSvgIcon(
  <path
    d="M6.5 12.5 5 5l3.5 3L12 3l3.5 5L19 5l-1.5 7.5zM6 16.5h12M6 20.5h12"
    fill="none"
    stroke="currentColor"
    strokeWidth={DRAWN_STROKE}
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  'KkViceCrownGlyph',
);

export const ChildCrownGlyph = createSvgIcon(
  <g
    fill="none"
    stroke="currentColor"
    strokeWidth={DRAWN_STROKE}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 19h14M6.5 16 5 9l3.5 2.5L12 7l3.5 4.5L19 9l-1.5 7z" />
    <circle cx="5" cy="7" r="1.4" />
    <circle cx="12" cy="4.6" r="1.4" />
    <circle cx="19" cy="7" r="1.4" />
  </g>,
  'KkChildCrownGlyph',
);

export const LaurelGlyph = createSvgIcon(
  <path
    d="M9.5 20.5C5.5 18 3.8 13.5 5 7.5M14.5 20.5c4-2.5 5.7-7 4.5-13M5 10.5c-1.7-.4-2.6-1.7-2.5-3.3 1.6.3 2.5 1.6 2.5 3.3zM5.6 15c-1.7.4-3-.3-3.6-1.8 1.6-.4 2.9.3 3.6 1.8zM19 10.5c1.7-.4 2.6-1.7 2.5-3.3-1.6.3-2.5 1.6-2.5 3.3zM18.4 15c1.7.4 3-.3 3.6-1.8-1.6-.4-2.9.3-3.6 1.8zM7.6 18.6c-1.3 1.1-2.8 1.2-4 .3 1.2-1.1 2.7-1.2 4-.3zM16.4 18.6c1.3 1.1 2.8 1.2 4 .3-1.2-1.1-2.7-1.2-4-.3z"
    fill="none"
    stroke="currentColor"
    strokeWidth={DRAWN_STROKE}
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  'KkLaurelGlyph',
);

export const QuillGlyph = createSvgIcon(
  <path
    d="M20.5 3.5C13 3.5 7.5 8.5 6.5 17.5M6.5 17.5c5.2-.2 9.6-3.2 11.6-8.2h-4.3l4.9-2.3c.8-1.1 1.4-2.3 1.8-3.5M6.5 17.5 3.5 20.5"
    fill="none"
    stroke="currentColor"
    strokeWidth={DRAWN_STROKE}
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  'KkQuillGlyph',
);

export const JingleBellGlyph = createSvgIcon(
  <g
    fill="none"
    stroke="currentColor"
    strokeWidth={DRAWN_STROKE}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 7a6.5 6.5 0 1 0 0 13 6.5 6.5 0 1 0 0-13M10.2 7.3a1.8 1.8 0 1 1 3.6 0M6.5 13h11" />
    <circle cx="12" cy="16.4" r="0.9" />
  </g>,
  'KkJingleBellGlyph',
);
