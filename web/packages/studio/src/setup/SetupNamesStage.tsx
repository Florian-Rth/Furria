import { SetupDeck } from '@furria/studio/SetupDeck';
import { SetupNameRow } from '@furria/studio/SetupNameRow';
import { SetupTaskPanel } from '@furria/studio/SetupTaskPanel';
import { SS_NAMES_LIST, SS_STAGE_TEXT } from '@furria/studio/step-setup-copy';
import { useSetupNames } from '@furria/studio/use-setup-names';
import type { StepSetup } from '@furria/studio/use-step-setup';
import { KkSsNames } from '@furria/ui/KkSsNames';
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
      <SetupTaskPanel task={names.task} title={SS_STAGE_TEXT.names} wide={wide}>
        <KkSsNames label={SS_NAMES_LIST}>{rows}</KkSsNames>
      </SetupTaskPanel>
    </>
  );
};
