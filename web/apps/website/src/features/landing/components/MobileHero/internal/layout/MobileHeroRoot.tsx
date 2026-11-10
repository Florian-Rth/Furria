import { kkTokens } from '@furria/ui/tokens';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { MASTHEAD_HEIGHT_CSS_VAR } from '@/components/Masthead/masthead-height';
import { MASTHEAD_PHOTO_UNDERLAY_PROPS } from '@/components/Masthead/masthead-underlay';
import { MobileHeroScrim } from '../ui/MobileHeroScrim';

export const MobileHeroRoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    {...MASTHEAD_PHOTO_UNDERLAY_PROPS}
    sx={{
      position: 'relative',
      aspectRatio: kkTokens.aspectRatio.portrait,
      marginTop: `calc(-1 * var(${MASTHEAD_HEIGHT_CSS_VAR}, 0px))`,
    }}
  >
    <MobileHeroScrim />
    {children}
  </Stack>
);
