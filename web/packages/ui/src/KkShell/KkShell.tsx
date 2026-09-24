import GlobalStyles from '@mui/material/GlobalStyles';
import Stack from '@mui/material/Stack';
import { MotionConfig, useScroll } from 'motion/react';
import type { ElementType, FC, PropsWithChildren } from 'react';
import { useState } from 'react';
import type { KkChromeMotion } from '../internal/chrome-density';
import { safeArea } from '../internal/safe-area';
import { useReducedMotion } from '../internal/use-reduced-motion';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import { KkShellActionSlot } from './internal/layout/KkShellActionSlot';
import { KkShellChrome } from './internal/layout/KkShellChrome';
import { KkShellFoot } from './internal/layout/KkShellFoot';
import { KkShellIndex } from './internal/layout/KkShellIndex';
import { KkShellTrack } from './internal/layout/KkShellTrack';
import { createBarMemory } from './internal/logic/bar-memory';
import type { KkScreenStance } from './internal/logic/screen-stance';
import { KkShellContext } from './internal/logic/shell-context';
import { KkShellScrollContext } from './internal/logic/shell-scroll';
import { useKeyboardInset } from './internal/logic/use-keyboard-inset';
import { useShellHost } from './internal/logic/use-shell-host';
import { KkShellNav } from './internal/ui/KkShellNav';
import { KkShellNotice } from './internal/ui/KkShellNotice';
import { KkShellSkipLink } from './internal/ui/KkShellSkipLink';
import type { KkScreenMove } from './screen-move';
import type { KkShellDestination } from './shell-destination';

const { gutter, barHeight, screen } = kkTokens.shell;

const BAR_CLEARANCE = gutter * 2 + barHeight;
const NO_CLEARANCE = 0;
const FIRST_ARRIVAL_BLOCK = 1;

interface KkShellProps extends PropsWithChildren {
  link: ElementType;
  destinations: readonly KkShellDestination[];
  path: string;
  move: KkScreenMove;
  sx?: KkSx;
}

export const KkShell: FC<KkShellProps> = ({ link, destinations, path, move, sx, children }) => {
  const { scrollY } = useScroll();
  const keyboardInset = useKeyboardInset();
  const reducedMotion = useReducedMotion();
  const chrome = useShellHost();
  const foot = useShellHost();
  const index = useShellHost();
  const [stance, holdStance] = useState<KkScreenStance | null>(null);
  const [barMemory] = useState(createBarMemory);

  const motion: KkChromeMotion = reducedMotion ? 'instant' : 'ramped';
  const scroll = { scrollY, motion };

  const section = stance?.section ?? null;
  const headClearance = stance?.headClearance ?? BAR_CLEARANCE;
  const footClearance = stance?.footClearance ?? gutter;
  const indexClearance = stance?.indexClearance ?? NO_CLEARANCE;
  const silent = stance?.kind === 'fullscreen';
  const arrivalBlocks = silent ? FIRST_ARRIVAL_BLOCK : screen.arrivalBlocks;

  const nav = section === null ? null : <KkShellNav section={section} />;
  const notice = silent ? null : <KkShellNotice />;

  const scrollClearance = {
    html: {
      scrollPaddingTop: safeArea('top', headClearance),
      scrollPaddingBottom: safeArea('bottom', footClearance),
    },
  };

  return (
    <KkShellContext.Provider
      value={{
        link,
        destinations,
        keyboardInset,
        path,
        move,
        chromeHost: chrome.node,
        footHost: foot.node,
        indexHost: index.node,
        holdStance,
        barMemory,
      }}
    >
      <KkShellScrollContext.Provider value={scroll}>
        <MotionConfig reducedMotion="user">
          <GlobalStyles styles={scrollClearance} />
          <Stack
            data-kk-shell
            sx={[
              { minHeight: '100dvh', minWidth: 0, bgcolor: 'background.default' },
              ...(Array.isArray(sx) ? sx : [sx]),
            ]}
          >
            <KkShellSkipLink />
            <KkShellChrome ref={chrome.hold} />
            <KkShellTrack
              headClearance={headClearance}
              footClearance={footClearance}
              indexClearance={indexClearance}
              arrivalBlocks={arrivalBlocks}
            >
              {children}
            </KkShellTrack>
            <KkShellIndex
              ref={index.hold}
              headClearance={headClearance}
              footClearance={footClearance}
            />
            <KkShellFoot raise={keyboardInset}>
              {notice}
              <KkShellActionSlot ref={foot.hold} />
              {nav}
            </KkShellFoot>
          </Stack>
        </MotionConfig>
      </KkShellScrollContext.Provider>
    </KkShellContext.Provider>
  );
};
