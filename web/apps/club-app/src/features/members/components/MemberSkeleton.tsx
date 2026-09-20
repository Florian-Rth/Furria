import { KkPanel, KkPanelSection, KkPanelStack, KkSkeletonBlock } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { MEMBER_SECTION_TITLES } from '../members-labels';

const ROW_LINES = 4;
const BLOCK_LINES = 3;

const LOADING_LABEL = 'Die Person wird geladen';

export const MemberSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
      <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
        <KkPanelStack>
          <KkPanelSection title={MEMBER_SECTION_TITLES.groups}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={ROW_LINES} />
            </KkPanel>
          </KkPanelSection>
          <KkPanelSection title={MEMBER_SECTION_TITLES.roles}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={BLOCK_LINES} />
            </KkPanel>
          </KkPanelSection>
        </KkPanelStack>
      </Grid>
      <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
        <KkPanelStack>
          <KkPanelSection title={MEMBER_SECTION_TITLES.club}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={BLOCK_LINES} />
            </KkPanel>
          </KkPanelSection>
          <KkPanelSection title={MEMBER_SECTION_TITLES.contact}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={ROW_LINES} />
            </KkPanel>
          </KkPanelSection>
        </KkPanelStack>
      </Grid>
    </Grid>
  </AppSkeletonRegion>
);
