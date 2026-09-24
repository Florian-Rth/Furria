import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import { groupToneInkPaint } from '../../../internal/group-tone';
import { KkLead } from '../../../KkLead';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { groupStageRevealAt } from '../group-stage-motion';
import { GROUP_STAGE_STEPS } from '../group-stage-reveal';

const MARK_WIDTH = kkTokens.line.page;
const MARK_HEIGHT = '1.15em';

interface KkGroupStageStandingProps extends PropsWithChildren {
  tone: KkGroupTone;
  sx?: KkSx;
}

export const KkGroupStageStanding: FC<KkGroupStageStandingProps> = ({ tone, sx, children }) => (
  <Stack
    direction="row"
    data-kk-group-stage-standing
    sx={[
      {
        minWidth: 0,
        gap: 1.25,
        alignItems: 'flex-start',
        ...groupStageRevealAt(GROUP_STAGE_STEPS.standing),
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Box
      aria-hidden
      sx={(theme) => ({
        width: MARK_WIDTH,
        height: MARK_HEIGHT,
        flexShrink: 0,
        backgroundColor: 'currentColor',
        ...groupToneInkPaint(theme, tone),
      })}
    />
    <KkLead sx={{ color: 'text.primary', fontWeight: 700 }}>{children}</KkLead>
  </Stack>
);
