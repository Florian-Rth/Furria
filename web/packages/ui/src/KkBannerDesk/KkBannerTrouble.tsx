import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkButton } from '../KkButton';
import { KkBannerPanel } from './KkBannerPanel';

interface KkBannerTroubleProps {
  message: string;
  tone: 'error' | 'warning';
  retry: string;
  remove: string;
  onRetry: () => void;
  onRemove: () => void;
}

export const KkBannerTrouble: FC<KkBannerTroubleProps> = ({
  message,
  tone,
  retry,
  remove,
  onRetry,
  onRemove,
}) => (
  <KkBannerPanel>
    <Typography
      variant="caption"
      sx={{ px: 1, fontWeight: 800, color: tone === 'error' ? 'error.main' : 'warning.dark' }}
    >
      {message}
    </Typography>
    <KkButton variant="contained" size="small" onClick={onRetry}>
      {retry}
    </KkButton>
    <KkButton variant="text" size="small" onClick={onRemove}>
      {remove}
    </KkButton>
  </KkBannerPanel>
);
