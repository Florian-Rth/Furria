import { KkPanel, KkPanelSection, KkPanelStack, KkSkeletonBlock } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { PROFILE_SECTION_TITLES } from '../profile-labels';

const VISIBILITY_LINES = 6;
const PREVIEW_LINES = 5;
const DATA_LINES = 3;
const MEMBERSHIP_LINES = 3;
const GROUPS_LINES = 3;
const LOADING_LABEL = 'Profil wird geladen';

export const ProfileSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
      <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
        <KkPanelStack>
          <KkPanelSection title={PROFILE_SECTION_TITLES.visibility}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={VISIBILITY_LINES} />
            </KkPanel>
          </KkPanelSection>
          <KkPanelSection title={PROFILE_SECTION_TITLES.preview}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={PREVIEW_LINES} />
            </KkPanel>
          </KkPanelSection>
        </KkPanelStack>
      </Grid>
      <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
        <KkPanelStack>
          <KkPanelSection title={PROFILE_SECTION_TITLES.data}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={DATA_LINES} />
            </KkPanel>
          </KkPanelSection>
          <KkPanelSection title={PROFILE_SECTION_TITLES.membership}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={MEMBERSHIP_LINES} />
            </KkPanel>
          </KkPanelSection>
          <KkPanelSection title={PROFILE_SECTION_TITLES.groups}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={GROUPS_LINES} />
            </KkPanel>
          </KkPanelSection>
        </KkPanelStack>
      </Grid>
    </Grid>
  </AppSkeletonRegion>
);
