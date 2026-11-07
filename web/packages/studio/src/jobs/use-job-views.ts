import type { EditJob } from '@furria/studio/edit-jobs';
import type { JobView } from '@furria/studio/edit-jobs-view';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { JobArrange } from '@furria/studio/use-arrange';
import { useCastJob } from '@furria/studio/use-cast-job';
import type { DeskBorders } from '@furria/studio/use-desk-borders';
import { useFormationJob } from '@furria/studio/use-formation-job';
import type { JobConfirm } from '@furria/studio/use-job-confirm';
import { useMovementJob } from '@furria/studio/use-movement-job';
import { useStepsJob } from '@furria/studio/use-steps-job';

export const useJobViews = (
  screen: StudioScreen,
  editor: ActStudioStage,
  arrange: JobArrange,
  borders: DeskBorders,
  confirm: JobConfirm,
  openPicker: () => void,
  openCompass: () => void,
): Record<EditJob, JobView> => ({
  steps: useStepsJob(screen, borders, confirm),
  formation: useFormationJob(screen, editor, arrange),
  movement: useMovementJob(screen, editor, arrange, confirm, openCompass),
  cast: useCastJob(screen, editor, arrange, confirm, openPicker),
});
