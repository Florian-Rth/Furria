import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import { groupToneFieldPaint } from '../../../internal/group-tone';
import { lineClamp } from '../../../internal/line-clamp';
import type { KkStartTileReach } from '../reach';
import { tileReachPropsOf } from '../reach';
import { DISPLAY_NUMBER, TILE_INNER_RADIUS, tilePressFill } from '../tile-paint';

const MEDAL = '3.25rem';

const rowPaint = (theme: Theme): CSSObject => ({
  width: '100%',
  minWidth: 0,
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: 1.25,
  textAlign: 'left',
  borderRadius: TILE_INNER_RADIUS,
  '&:active': tilePressFill(theme),
});

const medalPaint =
  (tone: KkGroupTone) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    width: MEDAL,
    height: MEDAL,
    borderRadius: TILE_INNER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    ...groupToneFieldPaint(theme, tone),
  });

const YEARS_PAINT: CSSObject = { ...DISPLAY_NUMBER, color: 'inherit' };
const NAME_PAINT: CSSObject = { ...lineClamp(2), fontWeight: 800, lineHeight: 1.25 };
const META_PAINT: CSSObject = { color: 'text.secondary', fontWeight: 600 };

interface KkStartTileJubileeProps {
  years: number;
  name: string;
  meta: string;
  tone: KkGroupTone;
  reach: KkStartTileReach;
}

export const KkStartTileJubilee: FC<KkStartTileJubileeProps> = ({
  years,
  name,
  meta,
  tone,
  reach,
}) => (
  <ButtonBase
    data-kk-start-tile-control
    data-kk-start-tile-jubilee
    {...tileReachPropsOf(reach)}
    sx={rowPaint}
  >
    <Stack component="span" aria-hidden sx={medalPaint(tone)}>
      <Typography component="span" variant="h2" sx={YEARS_PAINT}>
        {years}
      </Typography>
    </Stack>
    <Stack component="span" sx={{ minWidth: 0, flex: 1 }}>
      <Typography component="span" variant="body2" sx={NAME_PAINT}>
        {name}
      </Typography>
      <Typography component="span" variant="caption" noWrap sx={META_PAINT}>
        {meta}
      </Typography>
    </Stack>
  </ButtonBase>
);
