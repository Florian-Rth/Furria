import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { inkWashSurface } from '../../../internal/ink-wash';
import { skeletonSurface } from '../../../internal/skeleton-shimmer';
import { kkTokens } from '../../../tokens';

const PHONE_RATIO = kkTokens.aspectRatio.banner;
const DESKTOP_RATIO = '16 / 5';
const TOP_RADIUS = `${kkTokens.radius.base}px ${kkTokens.radius.base}px 0 0`;
const RULE_WASH_LIGHT = '22%';
const RULE_WASH_DARK = '26%';
const BAR_RADIUS = `${kkTokens.radius.pill}px`;
const STANDING_BAR = { width: '62%', height: 19 };
const META_BAR = { width: '38%', height: 13 };

export const KkGroupStageResting: FC = () => (
  <Stack aria-hidden data-kk-group-stage-resting sx={{ minWidth: 0 }}>
    <Box
      sx={[
        skeletonSurface,
        {
          width: '100%',
          aspectRatio: { xs: PHONE_RATIO, desktop: DESKTOP_RATIO },
          borderRadius: TOP_RADIUS,
        },
      ]}
    />
    <Box
      sx={(theme) => ({
        width: '100%',
        height: kkTokens.line.page,
        ...inkWashSurface(theme, RULE_WASH_LIGHT, RULE_WASH_DARK),
      })}
    />
    <Stack sx={{ minWidth: 0, gap: 1, pt: { xs: 1.75, desktop: 2.25 } }}>
      <Box sx={[skeletonSurface, { ...STANDING_BAR, borderRadius: BAR_RADIUS }]} />
      <Box sx={[skeletonSurface, { ...META_BAR, borderRadius: BAR_RADIUS }]} />
    </Stack>
  </Stack>
);
