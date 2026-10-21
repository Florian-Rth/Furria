import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { KkIcon } from './KkIcon';
import { stepFigures } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const foldPaint = (theme: Theme): CSSObject => ({
  alignSelf: 'flex-start',
  gap: 0.75,
  minHeight: kkTokens.tapTarget,
  px: 0.5,
  typography: 'caption',
  fontWeight: 700,
  color: 'text.secondary',
  borderRadius: `${kkTokens.radius.bar * 2}px`,
  ...focusRing(theme),
  '@media (hover: hover)': { '&:hover': { color: 'text.primary' } },
  '& [data-kk-icon]': { transition: 'transform 180ms ease-out' },
  '&[aria-expanded="true"] [data-kk-icon]': { transform: 'rotate(90deg)' },
});

interface KkQuietFoldProps {
  label: string;
  count: number;
  toggleLabel: string;
  open: boolean;
  controls: string;
  onToggle: () => void;
  sx?: KkSx;
}

export const KkQuietFold: FC<KkQuietFoldProps> = ({
  label,
  count,
  toggleLabel,
  open,
  controls,
  onToggle,
  sx,
}) => (
  <ButtonBase
    aria-expanded={open}
    aria-controls={controls}
    onClick={onToggle}
    data-kk-quiet-fold
    sx={[foldPaint, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <KkIcon name="chevron" size="small" />
    <Box component="span">{label}</Box>
    <Box component="span" sx={{ ...stepFigures, color: 'text.primary' }}>
      {count}
    </Box>
    <Box component="span" aria-hidden>
      ·
    </Box>
    <Box component="span" sx={{ textDecoration: 'underline', textUnderlineOffset: '0.2em' }}>
      {toggleLabel}
    </Box>
  </ButtonBase>
);
