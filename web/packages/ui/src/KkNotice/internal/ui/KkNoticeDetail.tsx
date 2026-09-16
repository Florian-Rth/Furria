import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkNoticeDetailProps {
  rows: readonly string[];
}

export const KkNoticeDetail: FC<KkNoticeDetailProps> = ({ rows }) => (
  <Stack data-kk-notice-detail sx={{ minWidth: 0, gap: 0.5 }}>
    {rows.map((row) => (
      <Typography
        key={row}
        variant="body2"
        sx={{ color: 'text.secondary', maxWidth: kkTokens.measure.note, textWrap: 'pretty' }}
      >
        {row}
      </Typography>
    ))}
  </Stack>
);
