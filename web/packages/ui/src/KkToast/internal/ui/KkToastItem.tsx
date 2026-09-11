import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { raisedSurfaceScheme } from '../../../internal/raised-surface';
import { applyScheme, schemeInk } from '../../../internal/scheme-paint';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { KkIconButton } from '../../../KkIconButton';
import { kkTokens } from '../../../tokens';
import type { KkToastTone } from '../logic/toast-queue';

const MAX_WIDTH = 420;

const toneIcons: Record<KkToastTone, KkIconName> = {
  success: 'check',
  error: 'bolt',
  info: 'info',
};

const toneInks: Record<KkToastTone, { light: string; dark: string }> = {
  success: { light: kkTokens.color.light.greenInk, dark: kkTokens.color.dark.greenInk },
  error: { light: kkTokens.color.light.redInk, dark: kkTokens.color.dark.redInk },
  info: { light: kkTokens.color.light.blueInk, dark: kkTokens.color.dark.blueInk },
};

interface KkToastItemProps {
  tone: KkToastTone;
  message: string;
  dismissLabel: string;
  icon?: KkIconName;
  onDismiss: () => void;
}

export const KkToastItem: FC<KkToastItemProps> = ({
  tone,
  message,
  dismissLabel,
  icon,
  onDismiss,
}) => (
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
      borderWidth: kkTokens.line.hair,
      borderStyle: 'solid',
      borderColor: 'divider',
      borderRadius: `${kkTokens.radius.base}px`,
      ...applyScheme(theme, raisedSurfaceScheme, {
        light: { boxShadow: kkTokens.shadow.raised },
        dark: { boxShadow: kkTokens.chrome.dark.lift },
      }),
    })}
  >
    <KkIcon
      name={icon ?? toneIcons[tone]}
      size="small"
      sx={(theme) => ({
        ...applyScheme(theme, schemeInk(toneInks[tone].light, toneInks[tone].dark)),
        flexShrink: 0,
      })}
    />
    <Typography
      variant="body2"
      sx={{ minWidth: 0, flexGrow: 1, fontWeight: 700, color: 'text.primary', textWrap: 'pretty' }}
    >
      {message}
    </Typography>
    <KkIconButton label={dismissLabel} icon="close" size="small" onClick={onDismiss} />
  </Stack>
);
