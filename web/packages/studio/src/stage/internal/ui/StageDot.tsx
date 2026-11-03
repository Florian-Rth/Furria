import type { KkStageInkDensity, KkStageInkDiscKind } from '@furria/ui/KkStageInk';
import { KkStageInk } from '@furria/ui/KkStageInk';
import Box from '@mui/material/Box';
import type { FC, KeyboardEvent } from 'react';
import type { StageEntrance } from '../layout/StagePlace';
import { StagePlace } from '../layout/StagePlace';

export type StageNameSide = 'below' | 'above' | 'none';

export interface StageDotKeys {
  label: string;
  onChoose: () => void;
  onNudge: (right: number, down: number) => void;
}

const layers: Record<KkStageInkDiscKind, number> = { open: 1, cast: 1, absent: 2, own: 3 };
const SELECTED_LAYER = 4;

const ARROWS: Readonly<Record<string, readonly [number, number]>> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

const CHOOSE_KEYS: ReadonlySet<string> = new Set(['Enter', ' ']);

interface StageDotProps {
  x: number;
  y: number;
  number: number;
  kind: KkStageInkDiscKind;
  density?: KkStageInkDensity;
  muted?: boolean;
  moving?: boolean;
  turn?: number | null;
  name?: string | null;
  nameSide?: StageNameSide;
  glide?: boolean;
  from?: StageEntrance | null;
  selected?: boolean;
  lifted?: boolean;
  dimmed?: boolean;
  keys?: StageDotKeys;
}

export const StageDot: FC<StageDotProps> = ({
  x,
  y,
  number,
  kind,
  density = 'full',
  muted = false,
  moving = false,
  turn = null,
  name = null,
  nameSide = 'none',
  glide = false,
  from = null,
  selected = false,
  lifted = false,
  dimmed = false,
  keys,
}) => {
  const nameEdge = nameSide === 'above' ? { bottom: '100%' } : { top: '100%' };
  const nameTag =
    name === null || nameSide === 'none' ? null : (
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          py: 0.25,
          ...nameEdge,
        }}
      >
        <KkStageInk.Name name={name} absent={kind === 'absent'} />
      </Box>
    );
  const press = (event: KeyboardEvent<HTMLElement>): void => {
    if (keys === undefined) {
      return;
    }
    const arrow = ARROWS[event.key];
    if (arrow !== undefined) {
      event.preventDefault();
      event.stopPropagation();
      keys.onNudge(arrow[0], arrow[1]);
      return;
    }
    if (CHOOSE_KEYS.has(event.key)) {
      event.preventDefault();
      keys.onChoose();
    }
  };
  const focusable =
    keys === undefined
      ? {}
      : {
          role: 'button',
          tabIndex: 0,
          'aria-label': keys.label,
          'aria-pressed': selected,
          onKeyDown: press,
        };
  const layer = selected || lifted ? SELECTED_LAYER : layers[kind];

  return (
    <StagePlace x={x} y={y} layer={layer} glide={glide} from={from}>
      <Box data-kk-stage-dot={kind} {...focusable} sx={{ position: 'relative' }}>
        <KkStageInk.Disc
          kind={kind}
          density={density}
          number={number}
          muted={muted}
          moving={moving}
          turn={turn}
          selected={selected}
          lifted={lifted}
          dimmed={dimmed}
        />
        {nameTag}
      </Box>
    </StagePlace>
  );
};
