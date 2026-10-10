import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';

const MARK = 14;
const GAP = -8;

const CORNERS = [
  { key: 'tl', top: GAP, left: GAP, borderTop: 1, borderLeft: 1 },
  { key: 'tr', top: GAP, right: GAP, borderTop: 1, borderRight: 1 },
  { key: 'bl', bottom: GAP, left: GAP, borderBottom: 1, borderLeft: 1 },
  { key: 'br', bottom: GAP, right: GAP, borderBottom: 1, borderRight: 1 },
] as const;

export const KkProofSheetTrimMarks: FC = () => {
  const marks = CORNERS.map(({ key, ...corner }) => (
    <Box
      key={key}
      aria-hidden
      data-kk-proof-trim={key}
      sx={(theme: Theme) => ({
        display: { xs: 'none', md: 'block' },
        position: 'absolute',
        width: MARK,
        height: MARK,
        borderColor: (theme.vars ?? theme).palette.text.disabled,
        pointerEvents: 'none',
        ...corner,
      })}
    />
  ));

  return <>{marks}</>;
};
