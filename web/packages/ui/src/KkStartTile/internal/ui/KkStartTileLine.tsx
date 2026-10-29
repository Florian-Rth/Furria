import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { lineClamp } from '../../../internal/line-clamp';
import { usePrintRun } from '../../../internal/print-in/print-run';
import { PRINT_EASE, PRINT_STILL, REDUCED_MOTION } from '../../../internal/print-in/print-stamp';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';
import type { KkStartTileReach } from '../reach';
import { tileReachPropsOf } from '../reach';
import { TILE_INNER_RADIUS, tilePressFill } from '../tile-paint';

const LINE_FRAME: CSSObject = {
  width: '100%',
  minWidth: 0,
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 1,
  textAlign: 'left',
};

const pressPaint = (theme: Theme): CSSObject => ({
  ...LINE_FRAME,
  borderRadius: TILE_INNER_RADIUS,
  '&:active': tilePressFill(theme),
});

const TEXT_FRAME: CSSObject = { flex: 1, minWidth: 0 };
const UNREAD_DOT = '0.5rem';

const UNREAD_DELAY_MS = 1180;
const UNREAD_MS = 380;

const overprint = keyframes`
  0% {
    opacity: 0;
    transform: scale(2.2);
  }
  60% {
    opacity: 1;
    transform: scale(0.88);
  }
  100% {
    opacity: 1;
    transform: none;
  }
`;

const unreadPaintOf =
  (settled: boolean) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    alignSelf: 'flex-start',
    mt: 0.75,
    width: UNREAD_DOT,
    height: UNREAD_DOT,
    borderRadius: '50%',
    ...redInk(theme),
    backgroundColor: 'currentColor',
    ...(settled
      ? PRINT_STILL
      : {
          animation: `${overprint} ${UNREAD_MS}ms ${PRINT_EASE} ${UNREAD_DELAY_MS}ms both`,
          [REDUCED_MOTION]: PRINT_STILL,
        }),
  });
const META_PAINT: CSSObject = { color: 'text.secondary', fontWeight: 600 };

const titlePaintOf = (lines: number): CSSObject => ({
  ...lineClamp(lines),
  fontWeight: 700,
  lineHeight: 1.3,
  letterSpacing: kkTokens.type.tracking.tight,
});

interface KkStartTileLineProps {
  title: string;
  meta?: string;
  lead?: ReactNode;
  lines?: number;
  unread?: boolean;
  label?: string;
  onClick?: () => void;
  reach?: KkStartTileReach;
}

export const KkStartTileLine: FC<KkStartTileLineProps> = ({
  title,
  meta,
  lead,
  lines = 1,
  unread = false,
  label,
  onClick,
  reach,
}) => {
  const { settled } = usePrintRun();
  const metaLine =
    meta === undefined ? null : (
      <Typography component="span" variant="caption" noWrap sx={META_PAINT}>
        {meta}
      </Typography>
    );
  const unreadDot = unread ? (
    <Stack component="span" aria-hidden sx={unreadPaintOf(settled)} />
  ) : null;
  const content = (
    <>
      {lead}
      <Stack component="span" sx={TEXT_FRAME}>
        <Typography component="span" variant="body2" sx={titlePaintOf(lines)}>
          {title}
        </Typography>
        {metaLine}
      </Stack>
      {unreadDot}
    </>
  );

  if (reach !== undefined) {
    return (
      <ButtonBase
        data-kk-start-tile-control
        data-kk-start-tile-line
        {...tileReachPropsOf(reach)}
        sx={pressPaint}
      >
        {content}
      </ButtonBase>
    );
  }

  if (onClick === undefined) {
    return (
      <Stack direction="row" data-kk-start-tile-line sx={LINE_FRAME}>
        {content}
      </Stack>
    );
  }

  return (
    <ButtonBase
      data-kk-start-tile-control
      data-kk-start-tile-line
      aria-label={label}
      onClick={onClick}
      sx={pressPaint}
    >
      {content}
    </ButtonBase>
  );
};
