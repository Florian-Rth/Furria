import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { groupToneFieldScheme, groupToneOnFieldScheme } from '../../../internal/group-tone';
import { redInk } from '../../../internal/red-ink';
import { applyScheme } from '../../../internal/scheme-paint';
import type { KkCalendarMark } from '../../../KkCalendarStrip/calendar-strip-types';
import type { KkEntryKindGlyphKind } from '../../../KkEntryKindGlyph';
import { KkEntryKindGlyph } from '../../../KkEntryKindGlyph';
import { kkTokens } from '../../../tokens';

const DISC = '2.75rem';

const discPaint =
  (mark: KkCalendarMark, live: boolean) =>
  (theme: Theme): CSSObject => {
    const base: CSSObject = {
      display: 'grid',
      placeItems: 'center',
      width: DISC,
      height: DISC,
      flexShrink: 0,
      borderRadius: `${kkTokens.radius.base - 2}px`,
    };

    if (live) {
      return { ...base, backgroundColor: 'primary.main', color: 'primary.contrastText' };
    }
    if (mark === 'club') {
      return { ...base, backgroundColor: 'text.primary', color: 'background.paper' };
    }

    return {
      ...base,
      ...applyScheme(theme, groupToneFieldScheme(mark), groupToneOnFieldScheme()),
    };
  };

interface KkCalendarDetailHeadProps {
  kind: KkEntryKindGlyphKind;
  kindLabel: string;
  title: string;
  when: string;
  liveLabel: string | null;
  mark: KkCalendarMark;
  trailing?: ReactNode;
}

export const KkCalendarDetailHead: FC<KkCalendarDetailHeadProps> = ({
  kind,
  kindLabel,
  title,
  when,
  liveLabel,
  mark,
  trailing,
}) => {
  const live =
    liveLabel === null ? null : (
      <Typography
        component="span"
        variant="caption"
        sx={(theme) => ({ fontWeight: 900, ...redInk(theme) })}
      >
        {liveLabel}
      </Typography>
    );

  return (
    <Stack direction="row" data-kk-calendar-detail-head sx={{ gap: 1.5, minWidth: 0, pt: 1 }}>
      <Box aria-hidden sx={discPaint(mark, liveLabel !== null)}>
        <KkEntryKindGlyph kind={kind} />
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0, gap: 0.25 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          <Typography
            component="span"
            variant="caption"
            sx={{
              fontWeight: 900,
              letterSpacing: kkTokens.type.tracking.label,
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {kindLabel}
          </Typography>
          {live}
        </Stack>
        <Typography component="h2" variant="h2" sx={{ overflowWrap: 'anywhere' }}>
          {title}
        </Typography>
        <Typography
          component="p"
          variant="subtitle2"
          sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}
        >
          {when}
        </Typography>
      </Stack>
      {trailing}
    </Stack>
  );
};
