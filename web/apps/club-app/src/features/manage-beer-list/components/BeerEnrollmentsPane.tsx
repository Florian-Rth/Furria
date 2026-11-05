import type { FC } from 'react';
import { useBeerHubContext } from '../beer-hub-context';
import {
  ENDED_SECTION,
  ENROLLMENTS_CONTEXT,
  ENROLLMENTS_TITLE,
  RUNNING_SECTION,
} from '../beer-hub-copy';
import { BeerEnrollmentSection } from './BeerEnrollmentSection';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerSettingsSwitch } from './BeerSettingsSwitch';

const SWITCHER = <BeerSettingsSwitch value="/beer-list/manage/enrollments" />;

export const BeerEnrollmentsPane: FC = () => {
  const hub = useBeerHubContext();
  const running = hub.enrollments.filter((enrollment) => enrollment.endedAt === null);
  const ended = hub.enrollments.filter((enrollment) => enrollment.endedAt !== null);

  return (
    <BeerPaneFrame
      switcher={SWITCHER}
      icon="person"
      title={ENROLLMENTS_TITLE}
      context={ENROLLMENTS_CONTEXT}
    >
      <BeerEnrollmentSection label={RUNNING_SECTION} enrollments={running} />
      <BeerEnrollmentSection label={ENDED_SECTION} enrollments={ended} />
    </BeerPaneFrame>
  );
};
