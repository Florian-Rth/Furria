import { KkPanel, KkSkeletonBlock } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { GROUP_SECTION_TITLES } from '../groups-labels';
import { GroupSection } from './GroupSection';

const ABOUT_LINES = 2;
const MEMBER_LINES = 6;
const ADMIN_LINES = 2;
const PHOTO_LINES = 3;

export const GroupSkeleton: FC = () => (
  <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
    <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
      <Stack sx={{ gap: 3.5, minWidth: 0 }}>
        <GroupSection title={GROUP_SECTION_TITLES.about}>
          <KkPanel variant="block">
            <KkSkeletonBlock lines={ABOUT_LINES} />
          </KkPanel>
        </GroupSection>
        <GroupSection title={GROUP_SECTION_TITLES.members}>
          <KkPanel variant="block">
            <KkSkeletonBlock lines={MEMBER_LINES} />
          </KkPanel>
        </GroupSection>
      </Stack>
    </Grid>
    <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
      <Stack sx={{ gap: 3.5, minWidth: 0 }}>
        <GroupSection title={GROUP_SECTION_TITLES.admins}>
          <KkPanel variant="block">
            <KkSkeletonBlock lines={ADMIN_LINES} />
          </KkPanel>
        </GroupSection>
        <GroupSection title={GROUP_SECTION_TITLES.photos}>
          <KkPanel variant="block">
            <KkSkeletonBlock lines={PHOTO_LINES} />
          </KkPanel>
        </GroupSection>
      </Stack>
    </Grid>
  </Grid>
);
