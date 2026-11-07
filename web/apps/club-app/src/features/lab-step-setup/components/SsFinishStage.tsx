import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useSetupFinish } from '../hooks/use-setup-finish';
import type { StepSetup } from '../hooks/use-step-setup';
import { SS_FINISH_ROWS, SS_STAGE_TEXT } from '../setup-copy';
import { SsDeck } from './SsDeck';
import { SsFinishRow } from './SsFinishRow';
import { SsTask } from './SsTask';

interface SsFinishStageProps {
  setup: StepSetup;
}

export const SsFinishStage: FC<SsFinishStageProps> = ({ setup }) => {
  const finish = useSetupFinish(setup);
  const wide = setup.screen.editor === 'desk';
  const rows = finish.rows.map((row) => <SsFinishRow key={row.key} row={row} />);

  return (
    <>
      <SsDeck setup={setup} timeline={finish.timeline} />
      <SsTask task={finish.task} title={SS_STAGE_TEXT.finish} wide={wide}>
        <Stack component="nav" aria-label={SS_FINISH_ROWS} sx={{ gap: 0, minWidth: 0 }}>
          {rows}
        </Stack>
      </SsTask>
    </>
  );
};
