import { JobCompassSection } from '@furria/studio/JobCompassSection';
import { JobHistoryPanel } from '@furria/studio/JobHistoryPanel';
import { JobPanel } from '@furria/studio/JobPanel';
import { JobPhoneDrawer } from '@furria/studio/JobPhoneDrawer';
import { JobPhoneMenu } from '@furria/studio/JobPhoneMenu';
import { JOB_FACING_LABEL, JOB_HISTORY, JOB_MENU_TITLE, JOB_TEXT } from '@furria/studio/job-copy';
import { compassSectionOf } from '@furria/studio/job-view';
import { StepListPanel } from '@furria/studio/StepListPanel';
import { StudioSetupList } from '@furria/studio/StudioSetupList';
import { SETUP_TITLE } from '@furria/studio/setup-copy';
import type { JobPhone } from '@furria/studio/use-job-phone';
import type { FC, ReactNode } from 'react';

interface JobPhoneDrawersProps {
  jobPhone: JobPhone;
  versions: ReactNode;
}

export const JobPhoneDrawers: FC<JobPhoneDrawersProps> = ({ jobPhone, versions }) => {
  const { screen, drawer } = jobPhone;
  const jobText = JOB_TEXT[jobPhone.jobs.job];
  const moreOpen = drawer === 'more';
  const menuOpen = drawer === 'menu';
  const historyOpen = drawer === 'history';
  const setupOpen = drawer === 'setup';
  const compass = compassSectionOf(jobPhone.view);
  const compassOpen = drawer === 'compass' && compass !== null;
  const compassBody =
    compass === null ? null : (
      <JobCompassSection title={compass.title} aside={compass.aside} compass={compass.compass} />
    );

  const jobBody =
    jobPhone.jobs.job === 'steps' ? (
      <StepListPanel screen={screen} />
    ) : (
      <JobPanel label={jobText} view={jobPhone.view} heading={jobText} />
    );

  return (
    <>
      <JobPhoneDrawer open={moreOpen} title={jobText} onClose={jobPhone.close}>
        {jobBody}
      </JobPhoneDrawer>
      <JobPhoneDrawer open={menuOpen} title={JOB_MENU_TITLE} onClose={jobPhone.close}>
        <JobPhoneMenu jobPhone={jobPhone} />
      </JobPhoneDrawer>
      <JobPhoneDrawer open={historyOpen} title={JOB_HISTORY} onClose={jobPhone.close}>
        <JobHistoryPanel history={screen.history} versions={versions} />
      </JobPhoneDrawer>
      <JobPhoneDrawer open={compassOpen} title={JOB_FACING_LABEL} onClose={jobPhone.close}>
        {compassBody}
      </JobPhoneDrawer>
      <JobPhoneDrawer open={setupOpen} title={SETUP_TITLE} onClose={jobPhone.close}>
        <StudioSetupList setup={jobPhone.setup} />
      </JobPhoneDrawer>
    </>
  );
};
