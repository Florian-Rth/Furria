import { KkPanel, KkPanelSection, KkSkeletonBlock } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import {
  APPLICANT_SECTION_TITLE,
  INTAKE_SECTION_TITLE,
} from '../manage-membership-applications-labels';

const LOADING_LABEL = 'Der Beitrittsantrag wird geladen';
const GRID_SPACING = { xs: 3.5, desktop: 5 };
const WIDE_SIZE = { xs: 12, desktop: 7 };
const NARROW_SIZE = { xs: 12, desktop: 5 };
const CELL_SX = { minWidth: 0 } as const;
const APPLICANT_LINES = 5;
const INTAKE_LINES = 2;

export const MembershipApplicationSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <Grid container spacing={GRID_SPACING} sx={CELL_SX}>
      <Grid size={WIDE_SIZE} sx={CELL_SX}>
        <KkPanelSection title={APPLICANT_SECTION_TITLE}>
          <KkPanel variant="block">
            <KkSkeletonBlock lines={APPLICANT_LINES} />
          </KkPanel>
        </KkPanelSection>
      </Grid>
      <Grid size={NARROW_SIZE} sx={CELL_SX}>
        <KkPanelSection title={INTAKE_SECTION_TITLE}>
          <KkPanel variant="block">
            <KkSkeletonBlock lines={INTAKE_LINES} />
          </KkPanel>
        </KkPanelSection>
      </Grid>
    </Grid>
  </AppSkeletonRegion>
);
