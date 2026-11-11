import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkMeta } from '../../../KkMeta';

interface KkNamesSheetTitleProps {
  title: string;
  count?: string;
}

export const KkNamesSheetTitle: FC<KkNamesSheetTitleProps> = ({ title, count }) => {
  const countMeta =
    count === undefined ? null : (
      <KkMeta component="span" sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
        {count}
      </KkMeta>
    );

  return (
    <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1, minWidth: 0 }}>
      <Typography variant="h4" component="h2" sx={{ flexGrow: 1, overflowWrap: 'anywhere' }}>
        {title}
      </Typography>
      {countMeta}
    </Stack>
  );
};
