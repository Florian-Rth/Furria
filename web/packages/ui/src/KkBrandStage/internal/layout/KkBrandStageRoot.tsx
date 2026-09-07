import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { KK_DARK_SCHEME_ATTRIBUTE } from '../../../theme';
import { KkBrandStageClubName } from '../ui/KkBrandStageClubName';
import { KkBrandStageNarrenruf } from '../ui/KkBrandStageNarrenruf';
import { KkBrandStageRule } from '../ui/KkBrandStageRule';
import { KkBrandStageWordmark } from '../ui/KkBrandStageWordmark';
import { KkBrandStageBrand } from './KkBrandStageBrand';

type KkBrandStageMode = 'panel' | 'boot';

interface KkBrandStageRootProps extends PropsWithChildren {
  mode?: KkBrandStageMode;
  sx?: KkSx;
}

interface KkBrandStageStatus {
  role?: 'status';
  'aria-busy'?: true;
}

const modeMinHeights: Record<KkBrandStageMode, string> = {
  panel: '100%',
  boot: '100dvh',
};

const modeStatus: Record<KkBrandStageMode, KkBrandStageStatus> = {
  panel: {},
  boot: { role: 'status', 'aria-busy': true },
};

const darkSchemeAttribute = { [KK_DARK_SCHEME_ATTRIBUTE]: '' };

export const KkBrandStageRoot: FC<KkBrandStageRootProps> = ({ mode = 'panel', sx, children }) => (
  <Stack
    {...darkSchemeAttribute}
    {...modeStatus[mode]}
    data-kk-brand-stage
    sx={[
      {
        flex: 1,
        minWidth: 0,
        minHeight: modeMinHeights[mode],
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
