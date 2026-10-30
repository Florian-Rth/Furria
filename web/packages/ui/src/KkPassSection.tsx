import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { useId } from 'react';
import { redInk } from './internal/red-ink';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const TITLE_PAINT: CSSObject = {
  ...kkTokens.eyebrow,
  m: 0,
  color: 'text.secondary',
  textTransform: 'uppercase',
};

const countPaint = (theme: Theme): CSSObject => ({
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: kkTokens.type.tracking.display,
  lineHeight: 1,
  ...redInk(theme),
});

interface KkPassSectionProps extends PropsWithChildren {
  title: string;
  count?: string;
  sx?: KkSx;
}

export const KkPassSection: FC<KkPassSectionProps> = ({ title, count, sx, children }) => {
  const titleId = useId();
  const countMark =
    count === undefined ? null : (
      <Typography component="span" variant="h4" sx={countPaint}>
        {count}
      </Typography>
    );

  return (
    <Stack
      component="section"
      aria-labelledby={titleId}
      data-kk-pass-section
      sx={[{ gap: 1, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1, minWidth: 0 }}>
        <Typography id={titleId} component="h2" variant="caption" sx={TITLE_PAINT}>
          {title}
        </Typography>
        {countMark}
      </Stack>
      {children}
    </Stack>
  );
};
