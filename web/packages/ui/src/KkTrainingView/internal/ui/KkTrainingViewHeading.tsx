import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkTrainingViewHeadingProps {
  title: string;
  tally: string | null;
}

export const KkTrainingViewHeading: FC<KkTrainingViewHeadingProps> = ({ title, tally }) => {
  const shownTally =
    tally === null ? null : (
      <Typography
        variant="subtitle2"
        component="span"
        sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
      >
        {tally}
      </Typography>
    );

  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 1.5, minWidth: 0 }}
    >
      <Typography variant="h4" component="h2" noWrap sx={{ minWidth: 0 }}>
        {title}
      </Typography>
      {shownTally}
    </Stack>
  );
};
