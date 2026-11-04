import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { raisedSurface } from '../internal/raised-surface';
import type { KkHoldConfirm } from '../KkHoldButton/KkHoldButton';
import { KkHoldButton } from '../KkHoldButton/KkHoldButton';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import type { KkPourCount } from './KkPourCountPicker';
import { KkPourCountPicker } from './KkPourCountPicker';
import { KkPourDrain } from './KkPourDrain';

export interface KkPourHold {
  label: string;
  hint: string;
  confirm: KkHoldConfirm;
}

export interface KkPourUndo {
  text: string;
  actionLabel: string;
  runKey: number;
  durationMs: number;
  onUndo: () => void;
}

const barPaint = (theme: Theme): CSSObject => ({
  gap: 0.75,
  p: 1,
  minWidth: 0,
  borderRadius: `${kkTokens.radius.base}px`,
  ...raisedSurface(theme),
  boxShadow: kkTokens.shadow.floating,
  ...theme.applyStyles('dark', { boxShadow: kkTokens.chrome.dark.lift }),
});

interface KkPourBarProps {
  countLabel: string;
  counts: readonly KkPourCount[];
  count: number;
  onCount: (value: number) => void;
  context: string | null;
  message: string | null;
  hold: KkPourHold;
  disabled: boolean;
  onCommit: () => void;
  undo: KkPourUndo | null;
  sx?: KkSx;
}

export const KkPourBar: FC<KkPourBarProps> = ({
  countLabel,
  counts,
  count,
  onCount,
  context,
  message,
  hold,
  disabled,
  onCommit,
  undo,
  sx,
}) => {
  const line = message ?? context;
  const contextLine =
    line === null ? null : (
      <Typography
        variant="caption"
        noWrap
        role={message === null ? undefined : 'status'}
        sx={{
          px: 0.5,
          fontWeight: 700,
          color: message === null ? 'text.secondary' : 'text.primary',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {line}
      </Typography>
    );

  if (undo !== null) {
    return (
      <Stack data-kk-pour-bar="undo" sx={[barPaint, ...(Array.isArray(sx) ? sx : [sx])]}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minHeight: '2.75rem' }}>
          <Typography
            variant="body2"
            role="status"
            noWrap
            sx={{ flex: 1, minWidth: 0, px: 0.5, fontWeight: 800 }}
          >
            {undo.text}
          </Typography>
          <Button
            variant="outlined"
            onClick={undo.onUndo}
            data-kk-pour-undo
            sx={{ flexShrink: 0, fontWeight: 900 }}
          >
            {undo.actionLabel}
          </Button>
        </Stack>
        <KkPourDrain runKey={undo.runKey} durationMs={undo.durationMs} />
      </Stack>
    );
  }

  return (
    <Stack data-kk-pour-bar="book" sx={[barPaint, ...(Array.isArray(sx) ? sx : [sx])]}>
      {contextLine}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <KkPourCountPicker label={countLabel} counts={counts} value={count} onChange={onCount} />
        <KkHoldButton
          label={hold.label}
          hint={hold.hint}
          confirm={hold.confirm}
          disabled={disabled}
          onCommit={onCommit}
          sx={{ flex: 1 }}
        />
      </Stack>
    </Stack>
  );
};
