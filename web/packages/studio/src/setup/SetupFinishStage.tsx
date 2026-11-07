import { SetupDeck } from '@furria/studio/SetupDeck';
import { SetupFinishRow } from '@furria/studio/SetupFinishRow';
import { SetupTaskPanel } from '@furria/studio/SetupTaskPanel';
import { SS_FINISH_ROWS, SS_STAGE_TEXT } from '@furria/studio/step-setup-copy';
import { useSetupFinish } from '@furria/studio/use-setup-finish';
import type { StepSetup } from '@furria/studio/use-step-setup';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

interface SetupFinishStageProps {
  setup: StepSetup;
}

export const SetupFinishStage: FC<SetupFinishStageProps> = ({ setup }) => {
  const finish = useSetupFinish(setup);
  const wide = setup.screen.editor === 'desk';
  const rows = finish.rows.map((row) => <SetupFinishRow key={row.key} row={row} />);

  return (
    <>
      <SetupDeck setup={setup} timeline={finish.timeline} />
      <SetupTaskPanel task={finish.task} title={SS_STAGE_TEXT.finish} wide={wide}>
        <Stack component="nav" aria-label={SS_FINISH_ROWS} sx={{ gap: 0, minWidth: 0 }}>
          {rows}
        </Stack>
      </SetupTaskPanel>
    </>
  );
};
