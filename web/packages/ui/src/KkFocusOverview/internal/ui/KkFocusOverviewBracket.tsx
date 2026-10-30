import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC, KeyboardEvent } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkStudioShare } from '../../../KkStudioDrag/use-studio-drag';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';
import { kkTokens } from '../../../tokens';
import type { KkFocusOverviewEdgeSide } from './KkFocusOverviewEdge';
import { KkFocusOverviewEdge } from './KkFocusOverviewEdge';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;
const PERCENT = 100;

export type KkFocusOverviewKey = 'earlier' | 'later' | 'closer' | 'wider';

const KEYS: Readonly<Record<string, KkFocusOverviewKey>> = {
  ArrowLeft: 'earlier',
  ArrowRight: 'later',
  ArrowUp: 'closer',
  ArrowDown: 'wider',
};

interface KkFocusOverviewBracketProps {
  start: number;
  end: number;
  label: string;
  valueText: string;
  onGrab: (share: number) => void;
  onPan: (share: number) => void;
  onEdge: (side: KkFocusOverviewEdgeSide, share: number) => void;
  onRelease: () => void;
  onKey: (key: KkFocusOverviewKey) => void;
}

export const KkFocusOverviewBracket: FC<KkFocusOverviewBracketProps> = ({
  start,
  end,
  label,
  valueText,
  onGrab,
  onPan,
  onEdge,
  onRelease,
  onKey,
}) => {
  const grab = (share: KkStudioShare): void => {
    onGrab(share.x);
  };
  const pan = (share: KkStudioShare): void => {
    onPan(share.x);
  };
  const drag = useStudioDrag({ onPress: grab, onMove: pan, onEnd: onRelease });
  const press = (event: KeyboardEvent<HTMLElement>): void => {
    const key = KEYS[event.key];
    if (key !== undefined) {
      event.preventDefault();
      event.stopPropagation();
      onKey(key);
    }
  };

  return (
    <Box
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuetext={valueText}
      aria-valuemin={0}
      aria-valuemax={PERCENT}
      aria-valuenow={Math.round(start * PERCENT)}
      {...drag}
      onKeyDown={press}
      data-kk-focus-bracket
      style={{ left: `${start * PERCENT}%`, width: `${(end - start) * PERCENT}%` }}
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        minWidth: '0.5rem',
        cursor: 'grab',
        touchAction: 'none',
        borderRadius: `${kkTokens.radius.bar * 2}px`,
        backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 10%, transparent)`,
        boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).text.primary}`,
        zIndex: 2,
        ...focusRing(theme),
      })}
    >
      <KkFocusOverviewEdge side="start" onMove={onEdge} onEnd={onRelease} />
      <KkFocusOverviewEdge side="end" onMove={onEdge} onEnd={onRelease} />
    </Box>
  );
};
