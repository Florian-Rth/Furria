import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const TOUCH_ONLY = '@media (hover: none) and (pointer: coarse)';

export const KkPracticeStepsKeys: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-practice-steps-keys
    sx={(theme) => ({
      px: 1.5,
      pt: 1.5,
      borderTop: `${kkTokens.line.hair}px solid ${(theme.vars ?? theme).palette.divider}`,
      [TOUCH_ONLY]: { display: 'none' },
    })}
  >
    {children}
  </Box>
);
