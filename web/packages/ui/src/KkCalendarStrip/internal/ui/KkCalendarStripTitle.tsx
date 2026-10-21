import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const TODAY_SEPARATOR = ' · ';

const BLOCK: CSSObject = {
  alignItems: 'flex-start',
  justifyContent: 'center',
  minWidth: 0,
  flex: '1 1 auto',
  minHeight: kkTokens.tapTarget,
  gap: '1px',
  textAlign: 'left',
  borderRadius: `${kkTokens.radius.bar * 2}px`,
};

const titlePaint: CSSObject = {
  fontWeight: 900,
  lineHeight: 1.1,
  letterSpacing: kkTokens.type.tracking.label,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  minWidth: 0,
};

const captionPaint: CSSObject = {
  fontWeight: 700,
  lineHeight: 1.1,
  color: 'text.secondary',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
};

const todayPaint = (theme: Theme): CSSObject => ({ ...redInk(theme), fontWeight: 800 });

interface KkCalendarStripTitleProps {
  title: string;
  caption: string;
  todayLabel: string;
  onToday?: () => void;
  sx?: KkSx;
}

export const KkCalendarStripTitle: FC<KkCalendarStripTitleProps> = ({
  title,
  caption,
  todayLabel,
  onToday,
  sx,
}) => {
  const heading = (
    <Typography component="span" variant="caption" sx={titlePaint}>
      {title}
    </Typography>
  );

  if (onToday === undefined) {
    return (
      <Stack
        data-kk-calendar-strip-title
        sx={[BLOCK, ...(Array.isArray(sx) ? sx : [sx])]}
        aria-live="polite"
      >
        {heading}
        <Typography component="span" variant="caption" sx={captionPaint}>
          {caption}
        </Typography>
      </Stack>
    );
  }

  return (
    <ButtonBase
      onClick={onToday}
      data-kk-calendar-strip-title
      sx={[
        (theme) => ({ ...BLOCK, display: 'flex', flexDirection: 'column', ...focusRing(theme) }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {heading}
      <Typography component="span" variant="caption" sx={captionPaint}>
        {caption}
        {TODAY_SEPARATOR}
        <Box component="span" sx={todayPaint}>
          {todayLabel}
        </Box>
      </Typography>
    </ButtonBase>
  );
};
