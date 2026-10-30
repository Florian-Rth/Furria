import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkLaneCardsMetaProps {
  text: string;
}

export const KkLaneCardsMeta: FC<KkLaneCardsMetaProps> = ({ text }) => (
  <Typography
    variant="caption"
    noWrap
    sx={{
      minWidth: 0,
      color: 'text.secondary',
      fontWeight: 700,
      fontVariantNumeric: 'tabular-nums',
    }}
  >
    {text}
  </Typography>
);
