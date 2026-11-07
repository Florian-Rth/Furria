import Box from '@mui/material/Box';
import type { FC } from 'react';
import { inkWash } from '../../../internal/ink-wash';
import { kkTokens } from '../../../tokens';
import type { KkTimelineLaneKind } from '../timeline-paint';
import { LANE_PLACES } from '../timeline-paint';

interface KkTimelineFocusProps {
  lane: KkTimelineLaneKind;
}

export const KkTimelineFocus: FC<KkTimelineFocusProps> = ({ lane }) => (
  <Box
    aria-hidden
    data-kk-timeline-focus={lane}
    style={LANE_PLACES[lane]}
    sx={(theme) => ({
      position: 'absolute',
      left: 0,
      right: 0,
      pointerEvents: 'none',
      backgroundColor: inkWash(theme, '9%'),
      boxShadow: `inset 0 ${kkTokens.line.hair}px 0 ${inkWash(theme, '18%')}, inset 0 -${kkTokens.line.hair}px 0 ${inkWash(theme, '18%')}`,
    })}
  />
);
