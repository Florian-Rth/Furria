import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';

const FADE_TOP = '--kk-setup-fade-top';
const FADE_BOTTOM = '--kk-setup-fade-bottom';
const FADE = '1.5rem';
const SCROLL_DRIVEN = '@supports (animation-timeline: scroll())';
const EDGE_MASK = `linear-gradient(to bottom, transparent 0, black var(${FADE_TOP}), black calc(100% - var(${FADE_BOTTOM})), transparent 100%)`;

const scrollEdges = keyframes`
  0% { ${FADE_TOP}: 0px; ${FADE_BOTTOM}: ${FADE}; }
  1% { ${FADE_TOP}: ${FADE}; ${FADE_BOTTOM}: ${FADE}; }
  99% { ${FADE_TOP}: ${FADE}; ${FADE_BOTTOM}: ${FADE}; }
  100% { ${FADE_TOP}: ${FADE}; ${FADE_BOTTOM}: 0px; }
`;

export const KkSetupTaskBody: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-setup-task-body
    sx={{
      flex: '0 1 auto',
      minWidth: 0,
      minHeight: 0,
      gap: 1,
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      [SCROLL_DRIVEN]: {
        [FADE_TOP]: '0px',
        [FADE_BOTTOM]: '0px',
        maskImage: EDGE_MASK,
        WebkitMaskImage: EDGE_MASK,
        animation: `${scrollEdges} linear both`,
        animationTimeline: 'scroll(self block)',
      },
    }}
  >
    {children}
  </Stack>
);
