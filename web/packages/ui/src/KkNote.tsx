import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkNoteTone = 'muted' | 'info' | 'warning';

interface KkNoteToneStyle {
  color: string;
  fontWeight?: number;
}

const toneStyles: Record<KkNoteTone, KkNoteToneStyle> = {
  muted: { color: 'text.secondary' },
  info: { color: 'info.main', fontWeight: 700 },
  warning: { color: 'warning.main', fontWeight: 700 },
};

interface KkNoteProps extends PropsWithChildren {
  tone?: KkNoteTone;
  icon?: KkIconName;
  sx?: KkSx;
}

export const KkNote: FC<KkNoteProps> = ({ tone = 'muted', icon, sx, children }) => {
  const callerSx = Array.isArray(sx) ? sx : [sx];
  const toneStyle = toneStyles[tone];

  if (icon === undefined) {
    return (
      <Typography
        variant="body2"
        data-kk-note
        sx={[{ ...toneStyle, maxWidth: kkTokens.measure.note, textWrap: 'pretty' }, ...callerSx]}
      >
        {children}
      </Typography>
    );
  }

  return (
    <Stack
      direction="row"
      data-kk-note
      sx={[
        {
          color: toneStyle.color,
          alignItems: 'flex-start',
          gap: 0.875,
          maxWidth: kkTokens.measure.note,
        },
        ...callerSx,
      ]}
    >
      <KkIcon name={icon} size="small" sx={{ flexShrink: 0, mt: 0.125 }} />
      <Typography
        variant="body2"
        sx={{
          color: 'inherit',
          fontWeight: toneStyle.fontWeight,
          textWrap: 'pretty',
          minWidth: 0,
        }}
      >
        {children}
      </Typography>
    </Stack>
  );
};
