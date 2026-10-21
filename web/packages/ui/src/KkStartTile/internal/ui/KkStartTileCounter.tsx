import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { lineClamp } from '../../../internal/line-clamp';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import type { KkStartTileReach } from '../reach';
import { tileReachPropsOf } from '../reach';
import { coinGround, TILE_INNER_RADIUS, tileHoverEdge, tilePressFill } from '../tile-paint';
import { KkStartTileCount } from './KkStartTileCount';

const counterPaint = (theme: Theme): CSSObject => ({
  width: '100%',
  height: '100%',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  gap: 0.25,
  px: 0.75,
  py: 0.625,
  textAlign: 'left',
  borderRadius: TILE_INNER_RADIUS,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'transparent',
  ...coinGround(theme),
  '&:active': tilePressFill(theme),
  '@media (hover: hover)': { '&:hover': tileHoverEdge(theme) },
});

const TOP_FRAME: CSSObject = {
  alignItems: 'center',
  gap: 0.625,
  color: 'text.secondary',
};

const LABEL_PAINT: CSSObject = {
  ...lineClamp(2),
  color: 'text.secondary',
  fontWeight: 700,
  lineHeight: 1.2,
  hyphens: 'auto',
};

interface KkStartTileCounterProps {
  icon: KkIconName;
  value: number;
  label: string;
  reach: KkStartTileReach;
}

export const KkStartTileCounter: FC<KkStartTileCounterProps> = ({ icon, value, label, reach }) => (
  <Box component="li" data-kk-start-tile-counter sx={{ minWidth: 0 }}>
    <ButtonBase data-kk-start-tile-control {...tileReachPropsOf(reach)} sx={counterPaint}>
      <Stack direction="row" sx={TOP_FRAME}>
        <KkIcon name={icon} size="small" />
        <KkStartTileCount value={value} size="small" />
      </Stack>
      <Typography component="span" variant="caption" sx={LABEL_PAINT}>
        {label}
      </Typography>
    </ButtonBase>
  </Box>
);
