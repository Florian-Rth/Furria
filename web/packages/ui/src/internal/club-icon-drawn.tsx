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

const drawnStroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: DRAWN_STROKE,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export const FruitGlyph = createSvgIcon(
  <g {...drawnStroke}>
    <circle cx="7" cy="17.5" r="3.5" />
    <circle cx="17" cy="16.5" r="3.5" />
    <path d="M7 14C8 10 11 6 14 3.5M17 13C16 9 15 6 14 3.5M14 3.5C16.5 2 19.5 2.5 21 5 18.5 6.3 15.8 5.7 14 3.5z" />
  </g>,
  'KkFruitGlyph',
);

export const SingerGlyph = createSvgIcon(
  <g {...drawnStroke}>
    <circle cx="8" cy="7" r="3.5" />
    <circle cx="15.6" cy="8.2" r="1.8" />
    <path d="M1.5 21c0-4 2.9-7 6.5-7s6.5 3 6.5 7M14.6 9.7 13 12.6M19.1 6q1.4 2.2 0 4.4M21.5 4.4q2.6 3.8 0 7.6" />
  </g>,
  'KkSingerGlyph',
);

export const WoodOvenGlyph = createSvgIcon(
  <path
    d="M2.5 20h19M4 20v-4a8 8 0 0 1 16 0v4M8.5 20v-3a3.5 3.5 0 0 1 7 0v3M15 8.6V4h2.5v6.2M6.2 11.5h2.6M15.2 11.5h2.6M4.4 15h2.2M17.4 15h2.2M12 19.6c-1 0-1.7-.7-1.7-1.6 0-1.1 1.7-2 1.7-2.8 0 .8 1.7 1.7 1.7 2.8 0 .9-.7 1.6-1.7 1.6z"
    {...drawnStroke}
  />,
  'KkWoodOvenGlyph',
);

export const ChickenGlyph = createSvgIcon(
  <path
    d="M7 9C7 7 8 5.5 9.5 5.5S12 6.7 12 8.2V10c2 .5 5-.5 7-3.5 2 2.5 2 6.5 0 9-1.5 2-4 3-7 3-3.5 0-6-2.5-6-5.5 0-1.5.5-3 1-4zM7.2 7.6 5 8.5l2 .9M8.5 5.6c-.2-1.4 1-2.1 1.5-1.1.6-1 2-.5 1.5 1.1M10.5 13.5c1.5 2 4.5 2 6-.5M11 18.5V21M15 18v3M9.8 21h2.5M13.8 21h2.5"
    {...drawnStroke}
  />,
  'KkChickenGlyph',
);

export const PearlGlyph = createSvgIcon(
  <g {...drawnStroke}>
    <circle cx="14" cy="10.8" r="2.8" />
    <path d="M4 15C3 9 7 3.5 13.5 2.5 10.5 6 7 10.5 4 15zM4 15c6-1.4 11.5-1.4 17-.4-2.2 5.4-12 6.4-17 .4zM8.5 18c3 .9 6.6.8 9.6-.5M12.8 10.2a1.4 1.4 0 0 1 1-1M19.6 6q.3 1.1 1.4 1.4-1.1.3-1.4 1.4-.3-1.1-1.4-1.4 1.1-.3 1.4-1.4z" />
  </g>,
  'KkPearlGlyph',
);

export const SeaShellGlyph = createSvgIcon(
  <path
    d="M20.5 3.5c-.9 1.3-2.1 1.5-3 1.4-.5 1.3-1.9 1.9-3.2 1.7-1 1.3-2.8 1.5-4.3 1.2-4 .2-6.5 3.2-6.5 6.7 0 4 3 6.5 7 6.5 4.5 0 7.5-3.5 7.3-7.5-.1-2 .7-3.5 1.2-5 .6-1.8 1.2-3.5 1.5-5zM17.5 4.9c.3 1.1.9 1.7 1.9 1.9M14.3 6.6c.5 1.9 2.2 3 4.4 2.8M10 7.8c.8 3 3.8 4.8 7.8 4.8M6.5 18c2.5.5 5.5-1 6.5-4.5-2 1-5 2-6.5 4.5z"
    {...drawnStroke}
  />,
  'KkSeaShellGlyph',
);

export const PrinceGlyph = createSvgIcon(
  <g {...drawnStroke}>
    <circle cx="12" cy="10.2" r="3.4" />
    <path d="M8.9 6.4 8.4 2.6l1.9 1.6L12 1.9l1.7 2.3 1.9-1.6-.5 3.8M4 21.5c0-3.5 2.2-6 5.2-6.9L12 18l2.8-3.4c3 .9 5.2 3.4 5.2 6.9M9.2 14.6 7.6 13M14.8 14.6l1.6-1.6" />
  </g>,
  'KkPrinceGlyph',
);
