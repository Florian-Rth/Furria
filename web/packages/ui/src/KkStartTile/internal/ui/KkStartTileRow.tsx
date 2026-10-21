import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import { groupToneFieldPaint } from '../../../internal/group-tone';
import { lineClamp } from '../../../internal/line-clamp';
import { kkTokens } from '../../../tokens';
import { DISPLAY_NUMBER, EYEBROW, SUBGRID_ROW, tilePressFill } from '../tile-paint';
import type { KkStartTileWhenTone } from '../when-tone';
import { whenInks } from '../when-tone';

const TICK_HEIGHT = '1rem';
const TICK_WIDTH = 3;

const rowPaint = (theme: Theme): CSSObject => ({
  ...SUBGRID_ROW,
  alignItems: 'center',
  width: '100%',
  minHeight: kkTokens.tapTarget,
  py: 0.75,
  textAlign: 'left',
  '&:active': tilePressFill(theme),
});

const dayPaint =
  (tone: KkStartTileWhenTone) =>
  (theme: Theme): CSSObject => ({
    ...EYEBROW,
    whiteSpace: 'nowrap',
    lineHeight: 1,
    letterSpacing: kkTokens.type.tracking.tight,
    '&:empty': { display: 'none' },
    ...whenInks[tone](theme),
  });

const TIME_PAINT: CSSObject = { ...DISPLAY_NUMBER, color: 'text.primary' };
const STAMP_FRAME: CSSObject = { minWidth: 0, gap: 0.25, justifyContent: 'center' };

const tickPaint =
  (tone: KkGroupTone | undefined) =>
  (theme: Theme): CSSObject =>
    tone === undefined
      ? {}
      : {
          width: TICK_WIDTH,
          height: TICK_HEIGHT,
          borderRadius: `${kkTokens.radius.bar}px`,
          ...groupToneFieldPaint(theme, tone),
        };

const TITLE_PAINT: CSSObject = {
  ...lineClamp(2),
  fontWeight: 700,
  lineHeight: 1.25,
  textWrap: 'pretty',
  hyphens: 'auto',
};

interface KkStartTileRowProps {
  day: string;
  dayTone: KkStartTileWhenTone;
  time: string;
  title: string;
  tick?: KkGroupTone;
  trailing?: ReactNode;
  label: string;
  onClick: () => void;
}

export const KkStartTileRow: FC<KkStartTileRowProps> = ({
  day,
  dayTone,
  time,
  title,
  tick,
  trailing,
  label,
  onClick,
}) => (
  <Box component="li" data-kk-start-tile-row sx={SUBGRID_ROW}>
    <ButtonBase data-kk-start-tile-control aria-label={label} onClick={onClick} sx={rowPaint}>
      <Stack component="span" sx={STAMP_FRAME}>
        <Typography component="span" variant="overline" sx={dayPaint(dayTone)}>
          {day}
        </Typography>
        <Typography component="span" variant="h4" sx={TIME_PAINT}>
          {time}
        </Typography>
      </Stack>
      <Box component="span" aria-hidden sx={tickPaint(tick)} />
      <Typography component="span" variant="body2" sx={TITLE_PAINT}>
        {title}
      </Typography>
      <Stack component="span" direction="row">
        {trailing}
      </Stack>
    </ButtonBase>
  </Box>
);
