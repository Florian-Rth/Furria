import { EJ_HISTORY, EJ_MUSIC_PAGE } from '@furria/studio/edit-jobs-copy';
import { SETUP_TITLE } from '@furria/studio/setup-copy';
import type { JobPhone } from '@furria/studio/use-job-phone';
import { KkEjMenuItem } from '@furria/ui/KkEjMenuItem';
import type { FC } from 'react';

interface JobPhoneMenuProps {
  ej: JobPhone;
}

export const JobPhoneMenu: FC<JobPhoneMenuProps> = ({ ej }) => {
  const { screen } = ej;
  const historyCount = String(screen.history.rows.length);
  const openHistory = (): void => {
    ej.open('history');
  };
  const setup = ej.setup.shown ? (
    <KkEjMenuItem
      text={SETUP_TITLE}
      glyph="check"
      aside={ej.setup.progressText}
      onPress={ej.toggleSetup}
    />
  ) : null;
  const music =
    screen.evening === null ? (
      <KkEjMenuItem text={EJ_MUSIC_PAGE} glyph="music" aside={null} onPress={ej.openMusic} />
    ) : null;

  return (
    <>
      <KkEjMenuItem text={EJ_HISTORY} glyph="history" aside={historyCount} onPress={openHistory} />
      {setup}
      {music}
    </>
  );
};
