import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { applyScheme } from '../../../internal/scheme-paint';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import type { KkSx } from '../../../kk-sx';
import type { KkNoticeTone } from '../../notice-declaration';
import { noticeIconName, noticeInkScheme } from '../logic/notice-tone';

const LINE_GAP = 1.25;

interface KkNoticeLineProps {
  tone: KkNoticeTone;
  message: string;
  icon?: KkIconName;
  sx?: KkSx;
}

export const KkNoticeLine: FC<KkNoticeLineProps> = ({ tone, message, icon, sx }) => (
  <Stack
    direction="row"
    data-kk-notice-line
    sx={[{ minWidth: 0, alignItems: 'center', gap: LINE_GAP }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <KkIcon
      name={noticeIconName(tone, icon)}
      size="small"
      sx={(theme) => ({ ...applyScheme(theme, noticeInkScheme(tone)), flexShrink: 0 })}
    />
    <Typography
      variant="body2"
      sx={{ minWidth: 0, flexGrow: 1, fontWeight: 700, color: 'text.primary', textWrap: 'pretty' }}
    >
      {message}
    </Typography>
  </Stack>
);
