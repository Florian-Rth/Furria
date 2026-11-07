import { StudioSetupList } from '@furria/studio/StudioSetupList';
import { SETUP_TITLE } from '@furria/studio/setup-copy';
import type { FC } from 'react';
import { EJ_FACING_LABEL, EJ_HISTORY, EJ_JOB_TEXT, EJ_MENU_TITLE } from '../edit-jobs-copy';
import { compassSectionOf } from '../edit-jobs-view';
import type { EjPhone } from '../hooks/use-ej-phone';
import type { EjVersions } from '../hooks/use-ej-versions';
import { EjCompassSection } from './EjCompassSection';
import { EjHistoryPanel } from './EjHistoryPanel';
import { EjJobPanel } from './EjJobPanel';
import { EjPhoneDrawer } from './EjPhoneDrawer';
import { EjPhoneMenu } from './EjPhoneMenu';
import { EjStepsJob } from './EjStepsJob';

interface EjPhoneDrawersProps {
  ej: EjPhone;
  versions: EjVersions;
}

export const EjPhoneDrawers: FC<EjPhoneDrawersProps> = ({ ej, versions }) => {
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
      <EjCompassSection title={compass.title} aside={compass.aside} compass={compass.compass} />
    );

  const jobBody =
    ej.jobs.job === 'steps' ? (
      <EjStepsJob screen={screen} />
    ) : (
      <EjJobPanel label={jobText} view={ej.view} heading={jobText} />
    );

  return (
    <>
      <EjPhoneDrawer open={moreOpen} title={jobText} onClose={ej.close}>
        {jobBody}
      </EjPhoneDrawer>
      <EjPhoneDrawer open={menuOpen} title={EJ_MENU_TITLE} onClose={ej.close}>
        <EjPhoneMenu ej={ej} />
      </EjPhoneDrawer>
      <EjPhoneDrawer open={historyOpen} title={EJ_HISTORY} onClose={ej.close}>
        <EjHistoryPanel history={screen.history} versions={versions} />
      </EjPhoneDrawer>
      <EjPhoneDrawer open={compassOpen} title={EJ_FACING_LABEL} onClose={ej.close}>
        {compassBody}
      </EjPhoneDrawer>
      <EjPhoneDrawer open={setupOpen} title={SETUP_TITLE} onClose={ej.close}>
        <StudioSetupList setup={ej.setup} />
      </EjPhoneDrawer>
    </>
  );
};
