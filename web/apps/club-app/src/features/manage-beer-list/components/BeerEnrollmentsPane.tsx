import { KkPourDay } from '@furria/ui/KkPourDay';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useBeerHubContext } from '../beer-hub-context';
import { ENROLLMENTS_TITLE } from '../beer-hub-copy';
import { BeerEnrollmentRow } from './BeerEnrollmentRow';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerSettingsSwitch } from './BeerSettingsSwitch';

const RUNNING_SECTION = 'Nehmen teil';
const ENDED_SECTION = 'Beendet';
const CONTEXT = 'Person öffnen, um die Teilnahme zu beenden';

const SWITCHER = <BeerSettingsSwitch value="/manage/beer-list/enrollments" />;

export const BeerEnrollmentsPane: FC = () => {
  const hub = useBeerHubContext();
  const running = hub.enrollments.filter((enrollment) => enrollment.endedAt === null);
  const ended = hub.enrollments.filter((enrollment) => enrollment.endedAt !== null);
  const runningRows = running.map((enrollment) => (
    <BeerEnrollmentRow key={enrollment.enrollmentId} enrollment={enrollment} />
  ));
  const endedRows = ended.map((enrollment) => (
    <BeerEnrollmentRow key={enrollment.enrollmentId} enrollment={enrollment} />
  ));
  const runningFacts = String(running.length);
  const endedFacts = String(ended.length);

  return (
    <BeerPaneFrame switcher={SWITCHER} icon="person" title={ENROLLMENTS_TITLE} context={CONTEXT}>
      <Stack>
        <KkPourDay label={RUNNING_SECTION} facts={runningFacts} />
        {runningRows}
      </Stack>
      <Stack>
        <KkPourDay label={ENDED_SECTION} facts={endedFacts} />
        {endedRows}
      </Stack>
    </BeerPaneFrame>
  );
};
