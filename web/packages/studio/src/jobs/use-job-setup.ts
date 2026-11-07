import { jobOfSetup } from '@furria/studio/job-model';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { StudioSetup, StudioSetupRow } from '@furria/studio/studio-setup-view';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { CurrentJob } from '@furria/studio/use-current-job';
import type { StudioSetupHost } from '@furria/studio/use-studio-setup';
import { useStudioSetup } from '@furria/studio/use-studio-setup';

export const useJobSetup = (
  screen: StudioScreen,
  editor: ActStudioStage,
  jobs: CurrentJob,
  host: StudioSetupHost,
): StudioSetup => {
  const setup = useStudioSetup(screen, editor, host);
  const withJob = (row: StudioSetupRow): StudioSetupRow => {
    const job = jobOfSetup(row.key);

    return job === null
      ? row
      : {
          ...row,
          act: () => {
            jobs.choose(job);
            row.act();
          },
        };
  };
  const rows = setup.rows.map(withJob);

  return {
    ...setup,
    rows,
    rowOf: (key) => {
      const row = setup.rowOf(key);

      return row === null ? null : withJob(row);
    },
  };
};
