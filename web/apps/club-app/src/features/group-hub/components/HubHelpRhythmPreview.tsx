import { KkPanel } from '@furria/ui/KkPanel';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { GroupTone } from '@/features/groups/group-identity';
import type { UsualTrainingTime } from '../schemas';
import { HubUsualTrainingTimeRow } from './HubUsualTrainingTimeRow';
import { HubWeekRhythm } from './HubWeekRhythm';

const SAMPLE_GROUP_ID = 0;

const TUESDAY_SAMPLE: UsualTrainingTime = {
  usualTrainingTimeId: 1,
  weekday: 'tuesday',
  startsAt: '19:00',
  durationMinutes: 120,
  venueId: null,
  venueName: 'Turnhalle',
};

const FRIDAY_SAMPLE: UsualTrainingTime = {
  usualTrainingTimeId: 2,
  weekday: 'friday',
  startsAt: '18:30',
  durationMinutes: 90,
  venueId: null,
  venueName: 'Vereinsheim',
};

const SAMPLE_TIMES: readonly UsualTrainingTime[] = [TUESDAY_SAMPLE, FRIDAY_SAMPLE];

interface HubHelpRhythmPreviewProps {
  tone: GroupTone;
}

export const HubHelpRhythmPreview: FC<HubHelpRhythmPreviewProps> = ({ tone }) => (
  <Stack sx={{ gap: 1.5, minWidth: 0 }}>
    <HubWeekRhythm tone={tone} usualTimes={SAMPLE_TIMES} />
    <KkPanel variant="list">
      <HubUsualTrainingTimeRow
        groupId={SAMPLE_GROUP_ID}
        usualTime={TUESDAY_SAMPLE}
        venueIsArchived={false}
        canManage={false}
      />
    </KkPanel>
  </Stack>
);
