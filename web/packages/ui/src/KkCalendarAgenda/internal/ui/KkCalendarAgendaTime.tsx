import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { KkFlapCount } from '../../../KkFlapCount';
import { rowDelayOf } from '../logic/agenda-motion';

export type KkCalendarTimeTone = 'ink' | 'live' | 'quiet';

const subPaint =
  (tone: KkCalendarTimeTone) =>
  (theme: Theme): CSSObject => ({
    fontWeight: 700,
    lineHeight: 1.25,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    ...(tone === 'live' ? redInk(theme) : { color: 'text.secondary' }),
  });

const mainPaint =
  (tone: KkCalendarTimeTone) =>
  (theme: Theme): CSSObject => {
    if (tone === 'live') {
      return redInk(theme);
    }

    return { color: tone === 'quiet' ? 'text.secondary' : 'text.primary' };
  };

interface KkCalendarAgendaTimeProps {
  main: string;
  sub: string | null;
  tone: KkCalendarTimeTone;
  order: number;
  accessibleLabel: string;
}

export const KkCalendarAgendaTime: FC<KkCalendarAgendaTimeProps> = ({
  main,
  sub,
  tone,
  order,
  accessibleLabel,
}) => {
  const subLine =
    sub === null ? null : (
      <Typography component="span" aria-hidden variant="caption" sx={subPaint(tone)}>
        {sub}
      </Typography>
    );

  return (
    <Stack
      component="span"
      aria-label={accessibleLabel}
      data-kk-calendar-time
      sx={{ minWidth: 0, alignItems: 'flex-start', pt: 0.125 }}
    >
      <KkFlapCount
        value={main}
        variant="h4"
        delaySeconds={rowDelayOf(order)}
        sx={[{ lineHeight: 1.15 }, mainPaint(tone)]}
      />
      {subLine}
    </Stack>
  );
};
