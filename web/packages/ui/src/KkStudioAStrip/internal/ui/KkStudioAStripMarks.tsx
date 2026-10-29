import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';

export type KkStudioAStripMarkKind = 'step' | 'cut';

export interface KkStudioAStripMark {
  key: string;
  at: number;
  kind: KkStudioAStripMarkKind;
}

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const markPaints: Record<KkStudioAStripMarkKind, (theme: Theme) => CSSObject> = {
  step: (theme) => ({ top: 0, bottom: 0, width: '1px', backgroundColor: palette(theme).divider }),
  cut: (theme) => ({
    top: '-0.25rem',
    bottom: '-0.25rem',
    width: 0,
    borderLeft: `2px dotted ${palette(theme).text.secondary}`,
  }),
};

interface KkStudioAStripMarksProps {
  marks: readonly KkStudioAStripMark[];
}

export const KkStudioAStripMarks: FC<KkStudioAStripMarksProps> = ({ marks }) => {
  const lines = marks.map((mark) => (
    <Box
      key={mark.key}
      data-kk-studio-a-mark={mark.kind}
      style={{ left: `${mark.at * PERCENT}%` }}
      sx={(theme) => ({ position: 'absolute', ...markPaints[mark.kind](theme) })}
    />
  ));

  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {lines}
    </Box>
  );
};
