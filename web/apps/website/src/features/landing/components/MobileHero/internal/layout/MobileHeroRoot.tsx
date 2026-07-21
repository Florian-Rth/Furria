import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { MASTHEAD_HEIGHT_CSS_VAR } from '@/components/Masthead/masthead-height';
import { MobileHeroScrim } from '../ui/MobileHeroScrim';

export const MobileHeroRoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    sx={{
      position: 'relative',
      aspectRatio: kkTokens.aspectRatio.portrait,
      overflow: 'hidden',
      marginTop: `calc(-1 * var(${MASTHEAD_HEIGHT_CSS_VAR}, 0px))`,
    }}
  >
    <MobileHeroScrim />
    {children}
  </Stack>
);
