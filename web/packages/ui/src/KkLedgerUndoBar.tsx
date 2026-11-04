import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { KkIcon } from './KkIcon';
import { stepFigures } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const drain = keyframes`
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
`;

const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: none;
  }
`;

const barPaint = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;

  return {
    position: 'relative',
    alignItems: 'center',
    gap: 1.5,
    minHeight: '3.25rem',
    pl: 1.75,
    pr: 0.75,
    borderRadius: `${kkTokens.radius.base}px`,
    backgroundColor: palette.text.primary,
    color: palette.background.paper,
    boxShadow: kkTokens.shadow.floating,
    animation: `${rise} 220ms ease-out both`,
  };
};

const undoPaint = (theme: Theme): CSSObject => ({
  gap: 0.5,
  minHeight: '2.5rem',
  px: 1.25,
  borderRadius: `${kkTokens.radius.base}px`,
  typography: 'body2',
  fontWeight: 900,
  color: 'inherit',
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: 'currentColor',
  ...focusRing(theme),
});

interface KkLedgerUndoBarProps {
  message: string;
  detail: string;
  actionLabel: string;
  seconds: number;
  durationMs: number;
  startKey: number;
  onUndo: () => void;
  sx?: KkSx;
}

export const KkLedgerUndoBar: FC<KkLedgerUndoBarProps> = ({
  message,
  detail,
  actionLabel,
  seconds,
  durationMs,
  startKey,
  onUndo,
  sx,
}) => (
  <Stack
    direction="row"
    role="status"
    data-kk-ledger-undo
    sx={[barPaint, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <KkIcon name="checkCircle" size="small" sx={{ flexShrink: 0 }} />
    <Stack sx={{ flex: 1, minWidth: 0, py: 0.75, lineHeight: 1.25 }}>
      <Box component="span" sx={{ ...stepFigures, typography: 'body2', fontWeight: 800 }}>
        {message}
      </Box>
      <Box component="span" sx={{ ...stepFigures, typography: 'caption', opacity: 0.72 }}>
        {detail}
      </Box>
    </Stack>
    <ButtonBase onClick={onUndo} data-kk-ledger-undo-action sx={undoPaint}>
      <KkIcon name="undo" sx={{ width: '1rem', height: '1rem' }} />
      {actionLabel}
      <Box component="span" sx={{ ...stepFigures, minWidth: '1.75rem', textAlign: 'right' }}>
        {`${seconds} s`}
      </Box>
    </ButtonBase>
    <Box
      key={startKey}
      component="span"
      aria-hidden
      sx={{
        position: 'absolute',
        left: kkTokens.radius.base,
        right: kkTokens.radius.base,
        bottom: 0,
        height: kkTokens.line.section,
        borderRadius: `${kkTokens.radius.bar}px`,
        bgcolor: 'currentColor',
        transformOrigin: 'left center',
        animation: `${drain} ${durationMs}ms linear both`,
      }}
    />
  </Stack>
);
