import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkStudioEFade } from '../../../KkStudioEText/internal/ui/KkStudioEFade';

const SHORT = '@container kk-studio-e (max-height: 40rem)';

interface KkStudioETransportStatusProps {
  statusKey: string;
  text: string;
  accent: boolean;
}

export const KkStudioETransportStatus: FC<KkStudioETransportStatusProps> = ({
  statusKey,
  text,
  accent,
}) => (
  <KkStudioEFade fadeKey={statusKey} sx={{ height: '1.125rem', [SHORT]: { display: 'none' } }}>
    <Typography
      variant="caption"
      data-kk-studio-e-status
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
  </KkStudioEFade>
);
