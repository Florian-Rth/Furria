import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkNewsProofChangedMark } from './KkNewsProofChangedMark';

interface KkNewsProofSheetTitleProps {
  label: string;
  changedLabel: string | null;
}

export const KkNewsProofSheetTitle: FC<KkNewsProofSheetTitleProps> = ({ label, changedLabel }) => {
  const changedMark =
    changedLabel === null ? null : <KkNewsProofChangedMark label={changedLabel} />;

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        pb: 1,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="overline"
        component="h2"
        sx={{ color: 'text.secondary', lineHeight: 1.4, wordSpacing: '0.25em' }}
      >
        {label}
      </Typography>
      {changedMark}
    </Stack>
  );
};
