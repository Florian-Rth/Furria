import { KkPanel, KkPanelSection, KkSkeletonBlock } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { PERSON_SECTION_TITLES } from '../manage-persons-labels';

const WIDE_LINES = 4;
const NARROW_LINES = 3;

const LOADING_LABEL = 'Die Person wird geladen';

export const PersonEditSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
      <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 3.5, minWidth: 0 }}>
          <KkPanelSection title={PERSON_SECTION_TITLES.memberships}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={WIDE_LINES} />
            </KkPanel>
          </KkPanelSection>
          <KkPanelSection title={PERSON_SECTION_TITLES.feeReductions}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={NARROW_LINES} />
            </KkPanel>
          </KkPanelSection>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 3.5, minWidth: 0 }}>
          <KkPanelSection title={PERSON_SECTION_TITLES.masterData}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={WIDE_LINES} />
            </KkPanel>
          </KkPanelSection>
          <KkPanelSection title={PERSON_SECTION_TITLES.groups}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={NARROW_LINES} />
            </KkPanel>
          </KkPanelSection>
        </Stack>
      </Grid>
    </Grid>
  </AppSkeletonRegion>
);
