import { SetupDeck } from '@furria/studio/SetupDeck';
import { SetupNameRow } from '@furria/studio/SetupNameRow';
import { SetupTaskPanel } from '@furria/studio/SetupTaskPanel';
import { SETUP_NAMES_LIST, SETUP_STAGE_TEXT } from '@furria/studio/step-setup-copy';
import { useSetupNames } from '@furria/studio/use-setup-names';
import type { StepSetup } from '@furria/studio/use-step-setup';
import { KkStepNames } from '@furria/ui/KkStepNames';
import type { FC } from 'react';

interface SetupNamesStageProps {
  setup: StepSetup;
}

export const SetupNamesStage: FC<SetupNamesStageProps> = ({ setup }) => {
  const names = useSetupNames(setup);
  const wide = setup.screen.editor === 'desk';
  const lastKey = names.rows.at(-1)?.key ?? null;
  const rows = names.rows.map((row) => (
    <SetupNameRow key={row.key} row={row} last={row.key === lastKey} />
  ));

  return (
    <>
      <SetupDeck setup={setup} timeline={names.timeline} />
      <SetupTaskPanel task={names.task} title={SETUP_STAGE_TEXT.names} wide={wide}>
        <KkStepNames label={SETUP_NAMES_LIST}>{rows}</KkStepNames>
      </SetupTaskPanel>
    </>
  );
};
