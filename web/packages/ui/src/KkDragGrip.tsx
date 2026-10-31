import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { focusRing } from './internal/focus-ring';
import { inkWashSurface } from './internal/ink-wash';
import { tapArea } from './internal/tap-area';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const keepMenuAway = (event: MouseEvent<HTMLButtonElement>): void => {
  event.preventDefault();
};

const GRIP_SIZE = '2.25rem';
const ICON_SIZE = '1.25rem';

const gripPaint =
  (active: boolean, pressed: boolean, cursor: 'grab' | 'pointer') =>
  (theme: Theme): CSSObject => ({
    width: GRIP_SIZE,
    height: GRIP_SIZE,
    flexShrink: 0,
    borderRadius: `${kkTokens.radius.base}px`,
    color: pressed || active ? 'text.primary' : 'text.secondary',
    touchAction: 'none',
    cursor: active ? 'grabbing' : cursor,
    ...(active ? inkWashSurface(theme, '10%', '16%') : {}),
    ...(pressed && !active ? inkWashSurface(theme, '6%', '10%') : {}),
    ...focusRing(theme),
    ...tapArea(),
    '@media (hover: hover)': {
      '&:hover': inkWashSurface(theme, '6%', '10%'),
    },
  });

interface KkDragGripProps {
  icon: KkIconName;
  label: string;
  active?: boolean;
  concealed?: boolean;
  pressed?: boolean;
  cursor?: 'grab' | 'pointer';
  gripKey?: string;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  sx?: KkSx;
}

export const KkDragGrip: FC<KkDragGripProps> = ({
  icon,
  label,
  active = false,
  concealed = false,
  pressed,
  cursor = 'grab',
  gripKey,
  onPointerDown,
  onKeyDown,
  onClick,
  sx,
}) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={pressed}
    data-kk-drag-grip={gripKey}
    disableRipple
    disabled={concealed}
    aria-hidden={concealed ? true : undefined}
    onPointerDown={onPointerDown}
    onKeyDown={onKeyDown}
    onClick={onClick}
    onContextMenu={keepMenuAway}
    sx={[
      gripPaint(active, pressed === true, cursor),
      { visibility: concealed ? 'hidden' : 'visible' },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <KkIcon name={icon} sx={{ width: ICON_SIZE, height: ICON_SIZE }} />
  </ButtonBase>
);
