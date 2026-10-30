import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KK_STUDIO_I_WIDE_SHORT } from '../../../KkStudioIEditor/studio-i-editor-query';

interface KkStudioIClipCaptionProps {
  name: string;
  meta: string;
}

export const KkStudioIClipCaption: FC<KkStudioIClipCaptionProps> = ({ name, meta }) => (
  <Stack
    direction="row"
    sx={{
      alignItems: 'baseline',
      gap: 1,
      minWidth: 0,
      px: 0.25,
      height: '1.5rem',
      [KK_STUDIO_I_WIDE_SHORT]: { display: 'none' },
    }}
  >
    <Typography
      variant="subtitle2"
      sx={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
    >
      {name}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        ml: 'auto',
        color: 'text.secondary',
        whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {meta}
    </Typography>
  </Stack>
);
