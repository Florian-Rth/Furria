import { TRAINING_LABEL } from '@/features/act-training/training-copy';
import { parsePositiveId } from '@/lib/positive-id';
import type { ActScreenSearch } from '../schemas';
import type { ActScreenPage } from './use-act-screen-page';
import { useActScreenPage } from './use-act-screen-page';

export interface ActTrainingPage extends ActScreenPage {
  title: string;
  trainingId: number | null;
  isTrainingMissing: boolean;
  redirectPath: string | null;
}

export const useActTrainingPage = (
  rawActId: string,
  rawTrainingId: string | null,
  search: ActScreenSearch,
): ActTrainingPage => {
  const trainingId = rawTrainingId === null ? null : parsePositiveId(rawTrainingId);
  const page = useActScreenPage(rawActId, search, 'training', null);
  const studio = page.load.query.data?.studio;
  const found =
    studio?.trainings.some((candidate) => candidate.calendarEntryId === trainingId) === true;

  return {
    ...page,
    title: `${page.load.name} · ${TRAINING_LABEL}`,
    trainingId,
    isTrainingMissing:
      rawTrainingId !== null && (trainingId === null || (studio !== undefined && !found)),
    redirectPath: page.access === 'hub' ? page.hubPath : null,
  };
};
