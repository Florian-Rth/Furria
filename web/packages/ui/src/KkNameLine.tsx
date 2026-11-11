import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { inkWash } from './internal/ink-wash';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

interface KkNameLineProps {
  names: string;
  more?: string;
  onOpen?: () => void;
  sx?: KkSx;
}

const openPaint = (theme: Theme): CSSObject => ({
  justifyContent: 'flex-start',
  width: '100%',
  minWidth: 0,
  textAlign: 'left',
  color: 'inherit',
  borderRadius: `${kkTokens.radius.bar * 2}px`,
  '@media (hover: hover)': { '&:hover': { backgroundColor: inkWash(theme, '7%') } },
  ...focusRing(theme),
});

export const KkNameLine: FC<KkNameLineProps> = ({ names, more, onOpen, sx }) => {
  const moreText =
    more === undefined ? null : (
      <Typography
        component="span"
        variant="inherit"
        sx={{ flexShrink: 0, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}
      >
        {more}
      </Typography>
    );
  const line = (
    <Stack
      component="span"
      direction="row"
      data-kk-name-line
      sx={[
        { alignItems: 'baseline', gap: 0.5, minWidth: 0, maxWidth: '100%' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Typography component="span" variant="inherit" noWrap sx={{ minWidth: 0 }}>
        {names}
      </Typography>
      {moreText}
    </Stack>
  );

  if (onOpen === undefined) {
    return line;
  }

  return (
    <ButtonBase component="span" onClick={onOpen} sx={openPaint}>
      {line}
    </ButtonBase>
  );
};
