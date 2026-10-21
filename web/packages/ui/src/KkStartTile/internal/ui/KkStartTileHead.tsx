import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import type { KkStartTileReach } from '../reach';
import { tileReachPropsOf } from '../reach';
import { EYEBROW, TILE_RADIUS } from '../tile-paint';

const HEAD_FRAME: CSSObject = {
  width: '100%',
  minWidth: 0,
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 0.75,
  color: 'text.secondary',
  textAlign: 'left',
};

const reachPaint = (theme: Theme): CSSObject => ({
  ...HEAD_FRAME,
  position: 'static',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: TILE_RADIUS,
  },
  '& [data-kk-start-tile-chevron]': { marginLeft: 'auto', transition: 'transform 160ms ease-out' },
  '@media (hover: hover)': {
    '&:hover [data-kk-start-tile-chevron]': { transform: 'translateX(2px)', ...redInk(theme) },
  },
});

const LABEL_PAINT: CSSObject = {
  ...EYEBROW,
  letterSpacing: kkTokens.type.tracking.section,
  flexShrink: 1,
};

interface KkStartTileHeadProps {
  icon: KkIconName;
  label: string;
  reach?: KkStartTileReach;
}

export const KkStartTileHead: FC<KkStartTileHeadProps> = ({ icon, label, reach }) => {
  const title = (
    <>
      <KkIcon name={icon} size="small" />
      <Typography component="h2" variant="overline" noWrap sx={LABEL_PAINT}>
        {label}
      </Typography>
    </>
  );

  if (reach === undefined) {
    return (
      <Stack direction="row" data-kk-start-tile-head sx={HEAD_FRAME}>
        {title}
      </Stack>
    );
  }

  return (
    <ButtonBase disableRipple data-kk-start-tile-reach {...tileReachPropsOf(reach)} sx={reachPaint}>
      {title}
      <Stack component="span" data-kk-start-tile-chevron aria-hidden>
        <KkIcon name="chevron" size="small" />
      </Stack>
    </ButtonBase>
  );
};
