import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

interface KkSheetTitleProps extends PropsWithChildren {
  id: string;
}

export const KkSheetTitle: FC<KkSheetTitleProps> = ({ id, children }) => (
  <Typography
    component="h2"
    id={id}
    data-kk-sheet-title
    sx={{
      flexShrink: 0,
      typography: 'h3',
      letterSpacing: kkTokens.type.tracking.display,
      lineHeight: 1.2,
      color: 'text.primary',
      px: 2.5,
      pb: 1.5,
    }}
  >
    {children}
  </Typography>
);
