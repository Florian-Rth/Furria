import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { BOARD_INK } from '../../../internal/status-paint';
import { KkFlapCount } from '../../../KkFlapCount';
import { boardLabel } from '../board-paint';

export interface KkFlapBoardFact {
  key: string;
  label: string;
  value: string;
}

interface KkFlapBoardMastheadProps {
  facts: readonly KkFlapBoardFact[];
}

export const KkFlapBoardMasthead: FC<KkFlapBoardMastheadProps> = ({ facts }) => {
  const items = facts.map((fact) => (
    <Stack
      key={fact.key}
      component="span"
      direction="row"
      sx={{ alignItems: 'baseline', columnGap: 0.75, minWidth: 0 }}
    >
      <Typography component="span" sx={boardLabel}>
        {fact.label}
      </Typography>
      <KkFlapCount value={fact.value} variant="overline" sx={{ color: BOARD_INK.ink }} />
    </Stack>
  ));

  return (
    <Stack
      direction="row"
      data-kk-flap-board-masthead
      sx={{
        flexWrap: 'wrap',
        columnGap: 2.5,
        rowGap: 0.5,
        pb: 1,
        minWidth: 0,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: BOARD_INK.line,
      }}
    >
      {items}
    </Stack>
  );
};
