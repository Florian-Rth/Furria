import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from './tokens';

interface KkNoteProps extends PropsWithChildren {
  sx?: SxProps<Theme>;
}

export const KkNote: FC<KkNoteProps> = ({ sx, children }) => (
  <Typography
    variant="body2"
    data-kk-note
    sx={[
      { color: 'text.secondary', maxWidth: kkTokens.measure.note, textWrap: 'pretty' },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Typography>
);
