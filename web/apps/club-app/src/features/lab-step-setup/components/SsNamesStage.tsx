import { KkSsNames } from '@furria/ui/KkSsNames';
import type { FC } from 'react';
import { useSetupNames } from '../hooks/use-setup-names';
import type { StepSetup } from '../hooks/use-step-setup';
import { SS_NAMES_LIST, SS_STAGE_TEXT } from '../setup-copy';
import { SsDeck } from './SsDeck';
import { SsNameRow } from './SsNameRow';
import { SsTask } from './SsTask';

interface SsNamesStageProps {
  setup: StepSetup;
}

export const SsNamesStage: FC<SsNamesStageProps> = ({ setup }) => {
  const names = useSetupNames(setup);
  const wide = setup.screen.editor === 'desk';
  const lastKey = names.rows.at(-1)?.key ?? null;
  const rows = names.rows.map((row) => (
    <SsNameRow key={row.key} row={row} last={row.key === lastKey} />
  ));

  return (
    <>
      <SsDeck setup={setup} timeline={names.timeline} />
      <SsTask task={names.task} title={SS_STAGE_TEXT.names} wide={wide}>
        <KkSsNames label={SS_NAMES_LIST}>{rows}</KkSsNames>
      </SsTask>
    </>
  );
};
