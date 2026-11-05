import type { FC } from 'react';
import type { KkHoldConfirm } from './KkHoldButton/KkHoldButton';
import { KkHoldButton } from './KkHoldButton/KkHoldButton';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkTabHoldSize = 'medium' | 'large';

const HEIGHTS: Record<KkTabHoldSize, string> = { medium: '3rem', large: '4.25rem' };
const HOLD_MS: Record<KkTabHoldSize, number> = { medium: 700, large: 900 };

interface KkTabHoldProps {
  label: string;
  hint: string;
  confirm: KkHoldConfirm;
  size?: KkTabHoldSize;
  disabled?: boolean;
  onCommit: () => void;
  sx?: KkSx;
}

export const KkTabHold: FC<KkTabHoldProps> = ({
  label,
  hint,
  confirm,
  size = 'medium',
  disabled = false,
  onCommit,
  sx,
}) => (
  <KkHoldButton
    label={label}
    hint={hint}
    confirm={confirm}
    holdMs={HOLD_MS[size]}
    disabled={disabled}
    onCommit={onCommit}
    sx={[
      {
        '& .MuiButton-root': {
          minHeight: HEIGHTS[size],
          borderRadius: `${kkTokens.radius.base}px`,
        },
        '& .MuiButton-root .MuiTypography-root': {
          typography: size === 'large' ? 'h4' : 'button',
        },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
);
