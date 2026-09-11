import { KkPanel, KkSkeletonBlock } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { MEMBER_SECTION_TITLES } from '../members-labels';
import { MemberSection } from './MemberSection';

const ROW_LINES = 4;
const BLOCK_LINES = 3;

export const MemberSkeleton: FC = () => (
  <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
    <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
      <Stack sx={{ gap: 3.5, minWidth: 0 }}>
        <MemberSection title={MEMBER_SECTION_TITLES.groups}>
          <KkPanel variant="block">
            <KkSkeletonBlock lines={ROW_LINES} />
          </KkPanel>
        </MemberSection>
        <MemberSection title={MEMBER_SECTION_TITLES.roles}>
          <KkPanel variant="block">
            <KkSkeletonBlock lines={BLOCK_LINES} />
          </KkPanel>
        </MemberSection>
      </Stack>
    </Grid>
    <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
      <Stack sx={{ gap: 3.5, minWidth: 0 }}>
        <MemberSection title={MEMBER_SECTION_TITLES.club}>
          <KkPanel variant="block">
            <KkSkeletonBlock lines={BLOCK_LINES} />
          </KkPanel>
        </MemberSection>
        <MemberSection title={MEMBER_SECTION_TITLES.contact}>
          <KkPanel variant="block">
            <KkSkeletonBlock lines={ROW_LINES} />
          </KkPanel>
        </MemberSection>
      </Stack>
    </Grid>
  </Grid>
);
