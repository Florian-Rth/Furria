import { StudioSetupList } from '@furria/studio/StudioSetupList';
import { SETUP_TITLE } from '@furria/studio/setup-copy';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';
import { backToOf, EJ_HISTORY, EJ_JOB_TEXT } from '../edit-jobs-copy';
import type { EjDesk } from '../hooks/use-ej-desk';
import type { EjVersions } from '../hooks/use-ej-versions';
import { EjHistoryPanel } from './EjHistoryPanel';
import { EjJobPanel } from './EjJobPanel';
import { EjStepsJob } from './EjStepsJob';

interface EjDeskPaneProps {
  ej: EjDesk;
  versions: EjVersions;
}

export const EjDeskPane: FC<EjDeskPaneProps> = ({ ej, versions }) => {
  const { screen } = ej;
  const jobText = EJ_JOB_TEXT[ej.jobs.job];
  const back = backToOf(jobText);

  if (ej.pane === 'history') {
    return (
      <KkEjPanel label={EJ_HISTORY}>
        <KkEjPanel.Head title={EJ_HISTORY} closeText={back} onClose={ej.closePane} />
        <EjHistoryPanel history={screen.history} versions={versions} />
      </KkEjPanel>
    );
  }
  if (ej.pane === 'setup') {
    return (
      <KkEjPanel label={SETUP_TITLE}>
        <KkEjPanel.Head title={SETUP_TITLE} closeText={back} onClose={ej.closePane} />
        <StudioSetupList setup={ej.setup} />
      </KkEjPanel>
    );
  }

  if (ej.jobs.job === 'steps') {
    return <EjStepsJob screen={screen} />;
  }

  return <EjJobPanel label={jobText} view={ej.view} heading={null} />;
};
