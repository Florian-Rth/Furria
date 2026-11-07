import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { DeskBorders } from '@furria/studio/use-desk-borders';
import type { EditJob } from '../edit-jobs';
import type { EjJobView } from '../edit-jobs-view';
import type { EjArrange } from './use-arrange';
import { useCastJob } from './use-cast-job';
import type { EjConfirm } from './use-ej-confirm';
import { useFormationJob } from './use-formation-job';
import { useMovementJob } from './use-movement-job';
import { useStepsJob } from './use-steps-job';

export const useJobViews = (
  screen: StudioScreen,
  editor: ActStudioStage,
  arrange: EjArrange,
  borders: DeskBorders,
  confirm: EjConfirm,
  openPicker: () => void,
  openCompass: () => void,
): Record<EditJob, EjJobView> => ({
  steps: useStepsJob(screen, borders, confirm),
  formation: useFormationJob(screen, editor, arrange),
  movement: useMovementJob(screen, editor, arrange, confirm, openCompass),
  cast: useCastJob(screen, editor, arrange, confirm, openPicker),
});
