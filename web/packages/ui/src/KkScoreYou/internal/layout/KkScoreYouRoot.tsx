import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { raisedSurface } from '../../../internal/raised-surface';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkScoreYouRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkScoreYouRoot: FC<KkScoreYouRootProps> = ({ label, sx, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-score-you
    sx={[
      (theme) => ({
        gap: 1,
        p: 1.25,
        minWidth: 0,
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
        ...raisedSurface(theme),
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
