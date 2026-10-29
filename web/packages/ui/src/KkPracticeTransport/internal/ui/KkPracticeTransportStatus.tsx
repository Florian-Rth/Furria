import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkPracticeFade } from '../../../KkPracticeText/internal/ui/KkPracticeFade';

const SHORT = '@container kk-practice (max-height: 40rem)';

interface KkPracticeTransportStatusProps {
  statusKey: string;
  text: string;
  accent: boolean;
}

export const KkPracticeTransportStatus: FC<KkPracticeTransportStatusProps> = ({
  statusKey,
  text,
  accent,
}) => (
  <KkPracticeFade fadeKey={statusKey} sx={{ height: '1.125rem', [SHORT]: { display: 'none' } }}>
    <Typography
      variant="caption"
      data-kk-practice-status
      sx={{
        display: 'block',
        textAlign: 'center',
        fontWeight: 700,
        lineHeight: '1.125rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: accent ? 'primary.main' : 'text.secondary',
      }}
    >
      {text}
    </Typography>
  </KkPracticeFade>
);
