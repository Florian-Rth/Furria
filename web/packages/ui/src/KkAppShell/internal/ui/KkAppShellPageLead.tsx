import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

export const KkAppShellPageLead: FC<PropsWithChildren> = ({ children }) => {
  if (children === undefined) {
    return null;
  }

  return (
    <Typography
      component="p"
      data-kk-app-shell-page-lead
      sx={{
        fontFamily: kkTokens.font.body,
        fontSize: { xs: '0.9375rem', desktop: '1rem' },
        fontWeight: 500,
        lineHeight: 1.5,
        color: 'text.secondary',
        maxWidth: kkTokens.measure.lead,
        textWrap: 'pretty',
      }}
    >
      {children}
    </Typography>
  );
};
