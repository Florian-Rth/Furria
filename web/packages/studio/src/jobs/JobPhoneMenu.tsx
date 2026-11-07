import { JOB_HISTORY, JOB_MUSIC_PAGE } from '@furria/studio/job-copy';
import { SETUP_TITLE } from '@furria/studio/setup-copy';
import type { JobPhone } from '@furria/studio/use-job-phone';
import { KkMenuItem } from '@furria/ui/KkMenuItem';
import type { FC } from 'react';

interface JobPhoneMenuProps {
  jobPhone: JobPhone;
}

export const JobPhoneMenu: FC<JobPhoneMenuProps> = ({ jobPhone }) => {
  const { screen } = jobPhone;
  const historyCount = String(screen.history.rows.length);
  const openHistory = (): void => {
    jobPhone.open('history');
  };
  const setup = jobPhone.setup.shown ? (
    <KkMenuItem
      text={SETUP_TITLE}
      glyph="check"
      aside={jobPhone.setup.progressText}
      onPress={jobPhone.toggleSetup}
    />
  ) : null;
  const music =
    screen.evening === null ? (
      <KkMenuItem text={JOB_MUSIC_PAGE} glyph="music" aside={null} onPress={jobPhone.openMusic} />
    ) : null;

  return (
    <>
      <KkMenuItem text={JOB_HISTORY} glyph="history" aside={historyCount} onPress={openHistory} />
      {setup}
      {music}
    </>
  );
};
