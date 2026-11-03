import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkScoreYouLeadProps extends PropsWithChildren {
  figure?: ReactNode;
  sx?: KkSx;
}

export const KkScoreYouLead: FC<KkScoreYouLeadProps> = ({ figure, sx, children }) => {
  const frame =
    figure === undefined || figure === null ? null : (
      <Box sx={{ width: '40%', maxWidth: '10rem', flexShrink: 0, minWidth: 0 }}>{figure}</Box>
    );

  return (
    <Stack
      direction="row"
      data-kk-score-you-lead
      sx={[{ alignItems: 'center', gap: 1.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {frame}
      <Stack sx={{ gap: 0.75, minWidth: 0, flex: 1, alignItems: 'flex-start' }}>{children}</Stack>
    </Stack>
  );
};
