import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { KK_DARK_SCHEME_ATTRIBUTE } from '../../../theme';
import { KkBrandStageClubName } from '../ui/KkBrandStageClubName';
import { KkBrandStageNarrenruf } from '../ui/KkBrandStageNarrenruf';
import { KkBrandStageRule } from '../ui/KkBrandStageRule';
import { KkBrandStageWordmark } from '../ui/KkBrandStageWordmark';
import { KkBrandStageBrand } from './KkBrandStageBrand';

interface KkBrandStageRootProps extends PropsWithChildren {
  sx?: KkSx;
}

const darkSchemeAttribute = { [KK_DARK_SCHEME_ATTRIBUTE]: '' };

export const KkBrandStageRoot: FC<KkBrandStageRootProps> = ({ sx, children }) => (
  <Stack
    {...darkSchemeAttribute}
    data-kk-brand-stage
    sx={[
      {
        flex: 1,
        minWidth: 0,
        minHeight: '100%',
        bgcolor: 'background.default',
        color: 'text.primary',
        px: { xs: 3, desktop: 5 },
        py: { xs: 4, desktop: 4.5 },
        gap: 3,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
    <KkBrandStageBrand>
      <KkBrandStageWordmark />
      <KkBrandStageRule />
      <KkBrandStageClubName />
      <KkBrandStageNarrenruf />
    </KkBrandStageBrand>
  </Stack>
);
