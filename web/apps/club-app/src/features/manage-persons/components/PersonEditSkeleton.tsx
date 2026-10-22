import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { ACCESS_SECTION_TITLE } from '@/features/account-access/account-access-labels';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import { PERSON_SECTION_TITLES } from '../manage-persons-labels';

const WIDE_LINES = 4;
const NARROW_LINES = 3;

const LOADING_LABEL = 'Die Person wird geladen';

export const PersonEditSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
      <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0, order: { xs: 2, desktop: 1 } }}>
        <KkPanelStack>
          <KkPanelSection title={PERSON_SECTION_TITLES.memberships}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={WIDE_LINES} />
            </KkPanel>
          </KkPanelSection>
        </KkPanelStack>
      </Grid>
      <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0, order: { xs: 1, desktop: 2 } }}>
        <KkPanelStack>
          <KkPanelSection title={ACCESS_SECTION_TITLE}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={NARROW_LINES} />
            </KkPanel>
          </KkPanelSection>
          <KkPanelSection title={PERSON_SECTION_TITLES.masterData}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={WIDE_LINES} />
            </KkPanel>
          </KkPanelSection>
        </KkPanelStack>
      </Grid>
    </Grid>
  </AppSkeletonRegion>
);
