import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkFlapBoardRowsProps extends PropsWithChildren {
  dimmed?: boolean;
  sx?: KkSx;
}

export const KkFlapBoardRows: FC<KkFlapBoardRowsProps> = ({ dimmed = false, sx, children }) => {
  const opacity = dimmed ? kkTokens.opacity.dimmed : 1;

  return (
    <Stack
      component="ul"
      data-kk-flap-board-rows
      sx={[
        { m: 0, p: 0, listStyle: 'none', rowGap: kkTokens.system.boardGap, minWidth: 0, opacity },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Stack>
  );
};
