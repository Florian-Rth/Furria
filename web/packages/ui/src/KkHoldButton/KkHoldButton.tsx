import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useId } from 'react';
import { KkVisuallyHidden } from '../KkVisuallyHidden';
import type { KkSx } from '../kk-sx';
import { KkHoldFill } from './internal/KkHoldFill';
import { KkHoldHint } from './internal/KkHoldHint';
import { useHoldGesture } from './use-hold-gesture';

const DEFAULT_HOLD_MS = 700;

interface KkHoldButtonProps {
  label: string;
  hint: string;
  note?: string | null;
  holdMs?: number;
  disabled?: boolean;
  onHold: () => void;
  onAssistiveActivate: () => void;
  sx?: KkSx;
}

export const KkHoldButton: FC<KkHoldButtonProps> = ({
  label,
  hint,
  note = null,
  holdMs = DEFAULT_HOLD_MS,
  disabled = false,
  onHold,
  onAssistiveActivate,
  sx,
}) => {
  const gesture = useHoldGesture({ holdMs, disabled, onHold, onAssistiveActivate });
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
        color="primary"
        disabled={disabled}
        aria-describedby={descriptionId}
        onPointerDown={gesture.onPointerDown}
        onPointerUp={gesture.onPointerRelease}
        onPointerLeave={gesture.onPointerRelease}
        onPointerCancel={gesture.onPointerRelease}
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
        <KkHoldFill holding={gesture.holding} holdMs={holdMs} />
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
    </Stack>
  );
};
