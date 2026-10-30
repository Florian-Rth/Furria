import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkLaneTrackRowSize } from '../lane-geometry';
import { LANE_HEAD_VAR, LANE_PAD, LANE_WIDTH_VAR, ROW_HEIGHTS } from '../lane-geometry';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkLaneTrackRowProps extends PropsWithChildren {
  label: string;
  aside: string | null;
  size: KkLaneTrackRowSize;
}

export const KkLaneTrackRow: FC<KkLaneTrackRowProps> = ({ label, aside, size, children }) => {
  const ruler = size === 'ruler';
  const note =
    aside === null ? null : (
      <Typography
        component="span"
        variant="caption"
        noWrap
        sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}
      >
        {aside}
      </Typography>
    );

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      data-kk-lane-row={size}
      sx={(theme) => ({
        position: ruler ? 'sticky' : 'relative',
        top: 0,
        zIndex: ruler ? 4 : 'auto',
        minHeight: ROW_HEIGHTS[size],
        backgroundColor: ruler ? palette(theme).background.paper : 'transparent',
        borderBottom: `${kkTokens.line.hair}px solid ${palette(theme).divider}`,
      })}
    >
      <Stack
        sx={(theme) => ({
          position: 'sticky',
          left: 0,
          zIndex: 3,
          flexShrink: 0,
          width: `var(${LANE_HEAD_VAR})`,
          justifyContent: 'center',
          px: 1.25,
          backgroundColor: palette(theme).background.paper,
          borderRight: `${kkTokens.line.hair}px solid ${palette(theme).divider}`,
        })}
      >
        <Typography
          component="span"
          variant="caption"
          noWrap
          sx={{
            fontWeight: 900,
            letterSpacing: kkTokens.type.tracking.label,
            textTransform: 'uppercase',
            lineHeight: 1.1,
            color: ruler ? 'text.secondary' : 'text.primary',
          }}
        >
          {label}
        </Typography>
        {note}
      </Stack>
      <Box
        data-kk-studio-track
        sx={{
          position: 'relative',
          flexShrink: 0,
          ml: LANE_PAD,
          mr: LANE_PAD,
          width: `var(${LANE_WIDTH_VAR})`,
          minHeight: ROW_HEIGHTS[size],
          touchAction: 'pan-x pan-y',
        }}
      >
        {children}
      </Box>
    </Stack>
  );
};
