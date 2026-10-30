import DragHandleRoundedIcon from '@mui/icons-material/DragHandleRounded';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, KeyboardEvent, PointerEvent } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { SHEET_ROW_SELECTOR, startEdgeDrag } from '../logic/sheet-metrics';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkEightsSheetGrip {
  label: string;
  active: boolean;
  onMove: (seconds: number) => void;
  onEnd: () => void;
  onNudge: (direction: -1 | 1) => void;
}

interface KkEightsSheetPartProps {
  name: string | null;
  continues: boolean;
  current: boolean;
  grip: KkEightsSheetGrip | null;
}

const NUDGES: Record<string, -1 | 1> = { ArrowUp: -1, ArrowDown: 1 };

export const KkEightsSheetPart: FC<KkEightsSheetPartProps> = ({
  name,
  continues,
  current,
  grip,
}) => {
  const press = (event: PointerEvent<HTMLElement>): void => {
    if (grip === null) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    startEdgeDrag(SHEET_ROW_SELECTOR, grip.onMove, grip.onEnd);
  };
  const key = (event: KeyboardEvent<HTMLElement>): void => {
    const direction = NUDGES[event.key];
    if (grip === null || direction === undefined) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    grip.onNudge(direction);
  };
  const title =
    name === null ? null : (
      <Typography
        component="span"
        variant="caption"
        sx={{
          minWidth: 0,
          fontWeight: kkTokens.eyebrow.fontWeight,
          letterSpacing: kkTokens.type.tracking.label,
          textTransform: 'uppercase',
          lineHeight: 1.1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </Typography>
    );
  const handle =
    grip === null ? null : (
      <ButtonBase
        aria-label={grip.label}
        aria-keyshortcuts="ArrowUp ArrowDown"
        data-active={grip.active}
        onPointerDown={press}
        onKeyDown={key}
        sx={(theme) => ({
          flexShrink: 0,
          width: '1.75rem',
          height: '100%',
          minHeight: '1.75rem',
          borderRadius: `${kkTokens.radius.bar}px`,
          cursor: 'ns-resize',
          touchAction: 'none',
          color: palette(theme).text.secondary,
          '&:hover, &[data-active="true"]': {
            color: palette(theme).primary.main,
            backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 10%, transparent)`,
          },
          ...focusRing(theme),
        })}
      >
        <DragHandleRoundedIcon fontSize="small" />
      </ButtonBase>
    );

  return (
    <Stack
      direction="row"
      role="cell"
      data-continues={continues}
      data-current={current}
      sx={(theme) => ({
        position: 'relative',
        alignItems: 'center',
        gap: 0.25,
        minWidth: 0,
        pl: 1,
        color: palette(theme).text.secondary,
        '&[data-current="true"]': { color: palette(theme).text.primary },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          borderLeft: `${kkTokens.line.page}px solid transparent`,
        },
        '&[data-continues="true"]::before, &:has(> span)::before': {
          borderLeftColor: palette(theme).text.disabled,
        },
        '&[data-current="true"]::before': { borderLeftColor: palette(theme).text.primary },
      })}
    >
      {title}
      {handle}
    </Stack>
  );
};
