import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useId } from 'react';
import type { KkButtonTone } from '../KkButton';
import { KkConfirmDialog } from '../KkConfirmDialog';
import { KkVisuallyHidden } from '../KkVisuallyHidden';
import type { KkSx } from '../kk-sx';
import { KkHoldFill } from './internal/KkHoldFill';
import { KkHoldHint } from './internal/KkHoldHint';
import { useHoldConfirm } from './use-hold-confirm';
import { useHoldGesture } from './use-hold-gesture';

const DEFAULT_HOLD_MS = 700;
const NO_FACTS = [] as const;

const BUTTON_COLORS = { default: 'primary', danger: 'error' } as const;
const CONFIRM_TONES = { default: 'neutral', danger: 'danger' } as const;

export interface KkHoldConfirm {
  eyebrow: string;
  question: string;
  explanation: string;
  consequence?: string;
  confirmLabel: string;
  cancelLabel: string;
  closeLabel: string;
}

interface KkHoldButtonProps {
  label: string;
  hint: string;
  confirm: KkHoldConfirm;
  note?: string | null;
  tone?: KkButtonTone;
  holdMs?: number;
  disabled?: boolean;
  onCommit: () => void;
  sx?: KkSx;
}

export const KkHoldButton: FC<KkHoldButtonProps> = ({
  label,
  hint,
  confirm,
  note = null,
  tone = 'default',
  holdMs = DEFAULT_HOLD_MS,
  disabled = false,
  onCommit,
  sx,
}) => {
  const confirmation = useHoldConfirm(onCommit);
  const gesture = useHoldGesture({
    holdMs,
    disabled,
    onHold: onCommit,
    onAssistiveActivate: confirmation.ask,
  });
  const descriptionId = useId();
  const description = note === null ? hint : `${hint}. ${note}`;
  const noteLine =
    note === null ? null : (
      <Typography
        aria-hidden
        variant="caption"
        noWrap
        sx={{
          display: { xs: 'none', md: 'block' },
          color: 'text.secondary',
          fontWeight: 700,
          textAlign: 'center',
        }}
      >
        {note}
      </Typography>
    );

  return (
    <Stack
      data-kk-hold-button
      sx={[
        { position: 'relative', gap: 0.5, alignItems: 'stretch', minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkHoldHint hint={hint} pulseKey={gesture.hintKey} />
      <Button
        variant="contained"
        color={BUTTON_COLORS[tone]}
        disabled={disabled}
        aria-describedby={descriptionId}
        onPointerDown={gesture.onPointerDown}
        onPointerMove={gesture.onPointerMove}
        onPointerUp={gesture.onPointerRelease}
        onPointerCancel={gesture.onPointerRelease}
        onLostPointerCapture={gesture.onPointerRelease}
        onClick={gesture.onClick}
        onKeyDown={gesture.onKeyDown}
        onContextMenu={gesture.onContextMenu}
        data-holding={gesture.holding}
        sx={{
          position: 'relative',
          isolation: 'isolate',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          touchAction: 'manipulation',
          whiteSpace: 'nowrap',
          px: { xs: 1.75, md: 2.5 },
          transition: 'transform 160ms ease-out',
          '&[data-holding="true"]': { transform: 'scale(0.97)' },
        }}
      >
        <KkHoldFill holding={gesture.holding} holdMs={holdMs} tone={tone} />
        <Typography
          component="span"
          variant="button"
          sx={{ position: 'relative', zIndex: 1, fontWeight: 900, lineHeight: 1.2 }}
        >
          {label}
        </Typography>
      </Button>
      <KkVisuallyHidden>
        <span id={descriptionId}>{description}</span>
      </KkVisuallyHidden>
      {noteLine}
      <KkConfirmDialog
        open={confirmation.open}
        onClose={confirmation.close}
        onConfirm={confirmation.confirm}
        tone={CONFIRM_TONES[tone]}
        eyebrow={confirm.eyebrow}
        question={confirm.question}
        explanation={confirm.explanation}
        facts={NO_FACTS}
        consequence={confirm.consequence}
        confirmLabel={confirm.confirmLabel}
        cancelLabel={confirm.cancelLabel}
        closeLabel={confirm.closeLabel}
      />
    </Stack>
  );
};
