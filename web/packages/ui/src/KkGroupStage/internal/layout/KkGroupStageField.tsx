import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import { groupToneFieldPaint } from '../../../internal/group-tone';
import { kkTokens } from '../../../tokens';

const PHONE_RATIO = kkTokens.aspectRatio.banner;
const DESKTOP_RATIO = '16 / 5';
const TOP_RADIUS = `${kkTokens.radius.base}px ${kkTokens.radius.base}px 0 0`;

interface KkGroupStageFieldProps extends PropsWithChildren {
  tone: KkGroupTone;
}

export const KkGroupStageField: FC<KkGroupStageFieldProps> = ({ tone, children }) => (
  <Box
    data-kk-group-stage-field
    sx={(theme) => ({
      position: 'relative',
      isolation: 'isolate',
      overflow: 'hidden',
      width: '100%',
      minWidth: 0,
      aspectRatio: { xs: PHONE_RATIO, desktop: DESKTOP_RATIO },
      borderRadius: TOP_RADIUS,
      ...groupToneFieldPaint(theme, tone),
    })}
  >
    {children}
  </Box>
);
