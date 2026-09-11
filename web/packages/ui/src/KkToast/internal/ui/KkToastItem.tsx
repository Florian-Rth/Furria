import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { raisedSurface } from '../../../internal/raised-surface';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { KkIconButton } from '../../../KkIconButton';
import { kkTokens } from '../../../tokens';
import type { KkToastTone } from '../logic/toast-queue';

const DISMISS_LABEL = 'Schließen';
const MAX_WIDTH = 420;
const TOAST_BORDER = 1.5;

const toneIcons: Record<KkToastTone, KkIconName> = {
  success: 'check',
  error: 'bolt',
  info: 'info',
};

const toneColors: Record<KkToastTone, string> = {
  success: 'success.main',
  error: 'error.main',
  info: 'info.main',
};

interface KkToastItemProps {
  tone: KkToastTone;
  message: string;
  icon?: KkIconName;
  onDismiss: () => void;
}

export const KkToastItem: FC<KkToastItemProps> = ({ tone, message, icon, onDismiss }) => (
  <Stack
    direction="row"
    data-kk-toast-item
    sx={(theme) => ({
      minWidth: 0,
      maxWidth: MAX_WIDTH,
      alignItems: 'center',
      gap: 1.25,
      pl: 1.75,
      pr: 0.75,
      py: 1,
      border: TOAST_BORDER,
      borderColor: 'divider',
      borderRadius: `${kkTokens.radius.base}px`,
      boxShadow: kkTokens.shadow.raised,
      ...raisedSurface(theme),
    })}
  >
    <KkIcon
      name={icon ?? toneIcons[tone]}
      size="small"
      sx={{ color: toneColors[tone], flexShrink: 0 }}
    />
    <Typography
      variant="body2"
      sx={{ minWidth: 0, flexGrow: 1, fontWeight: 700, color: 'text.primary', textWrap: 'pretty' }}
    >
      {message}
    </Typography>
    <KkIconButton label={DISMISS_LABEL} icon="close" size="small" onClick={onDismiss} />
  </Stack>
);
