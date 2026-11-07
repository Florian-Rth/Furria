import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { KkVisuallyHidden } from './KkVisuallyHidden';
import { kkTokens } from './tokens';

export type KkSsStageState = 'done' | 'open' | 'locked';

export interface KkSsStageCell {
  key: string;
  label: string;
  state: KkSsStageState;
  current: boolean;
}

interface KkSsStagesProps {
  label: string;
  cells: readonly KkSsStageCell[];
}

const BAR = 4;
const CURRENT_BAR = 6;
const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const DONE_SHARE = '40%';

const barPaint = (theme: Theme, cell: KkSsStageCell): CSSObject => {
  if (cell.current) {
    return { height: CURRENT_BAR, backgroundColor: palette(theme).text.primary };
  }
  const ink = {
    done: `color-mix(in srgb, ${palette(theme).text.primary} ${DONE_SHARE}, transparent)`,
    open: palette(theme).divider,
    locked: `color-mix(in srgb, ${palette(theme).divider} 50%, transparent)`,
  }[cell.state];

  return { height: BAR, backgroundColor: ink };
};

export const KkSsStages: FC<KkSsStagesProps> = ({ label, cells }) => {
  const bars = cells.map((cell) => (
    <Stack
      key={cell.key}
      component="li"
      aria-current={cell.current ? 'step' : undefined}
      sx={{ flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}
    >
      <Box
        component="span"
        sx={(theme) => ({
          display: 'block',
          width: '100%',
          borderRadius: `${kkTokens.radius.bar}px`,
          ...barPaint(theme, cell),
        })}
      />
      <KkVisuallyHidden>{cell.label}</KkVisuallyHidden>
    </Stack>
  ));

  return (
    <Stack
      component="ol"
      direction="row"
      aria-label={label}
      sx={(theme) => ({
        m: 0,
        p: 0,
        listStyle: 'none',
        gap: 0.5,
        minWidth: 0,
        height: theme.spacing(kkTokens.setupFrame.stageBar),
      })}
    >
      {bars}
    </Stack>
  );
};
