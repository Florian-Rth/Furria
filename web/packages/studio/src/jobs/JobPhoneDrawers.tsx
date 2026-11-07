import {
  EJ_FACING_LABEL,
  EJ_HISTORY,
  EJ_JOB_TEXT,
  EJ_MENU_TITLE,
} from '@furria/studio/edit-jobs-copy';
import { compassSectionOf } from '@furria/studio/edit-jobs-view';
import { JobCompassSection } from '@furria/studio/JobCompassSection';
import { JobHistoryPanel } from '@furria/studio/JobHistoryPanel';
import { JobPanel } from '@furria/studio/JobPanel';
import { JobPhoneDrawer } from '@furria/studio/JobPhoneDrawer';
import { JobPhoneMenu } from '@furria/studio/JobPhoneMenu';
import { StepListPanel } from '@furria/studio/StepListPanel';
import { StudioSetupList } from '@furria/studio/StudioSetupList';
import { SETUP_TITLE } from '@furria/studio/setup-copy';
import type { JobPhone } from '@furria/studio/use-job-phone';
import type { FC, ReactNode } from 'react';

interface JobPhoneDrawersProps {
  ej: JobPhone;
  versions: ReactNode;
}

export const JobPhoneDrawers: FC<JobPhoneDrawersProps> = ({ ej, versions }) => {
  const { screen, drawer } = ej;
  const jobText = EJ_JOB_TEXT[ej.jobs.job];
  const moreOpen = drawer === 'more';
  const menuOpen = drawer === 'menu';
  const historyOpen = drawer === 'history';
  const setupOpen = drawer === 'setup';
  const compass = compassSectionOf(ej.view);
  const compassOpen = drawer === 'compass' && compass !== null;
  const compassBody =
    compass === null ? null : (
      <JobCompassSection title={compass.title} aside={compass.aside} compass={compass.compass} />
    );

  const jobBody =
    ej.jobs.job === 'steps' ? (
      <StepListPanel screen={screen} />
    ) : (
      <JobPanel label={jobText} view={ej.view} heading={jobText} />
    );

  return (
    <>
      <JobPhoneDrawer open={moreOpen} title={jobText} onClose={ej.close}>
        {jobBody}
      </JobPhoneDrawer>
      <JobPhoneDrawer open={menuOpen} title={EJ_MENU_TITLE} onClose={ej.close}>
        <JobPhoneMenu ej={ej} />
      </JobPhoneDrawer>
      <JobPhoneDrawer open={historyOpen} title={EJ_HISTORY} onClose={ej.close}>
        <JobHistoryPanel history={screen.history} versions={versions} />
      </JobPhoneDrawer>
      <JobPhoneDrawer open={compassOpen} title={EJ_FACING_LABEL} onClose={ej.close}>
        {compassBody}
      </JobPhoneDrawer>
      <JobPhoneDrawer open={setupOpen} title={SETUP_TITLE} onClose={ej.close}>
        <StudioSetupList setup={ej.setup} />
      </JobPhoneDrawer>
    </>
  );
};
