import { HallBody } from '@furria/studio/HallBody';
import type { FC } from 'react';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { actPagePathOf } from '../acts-origin';
import type { ActTrainingPage } from '../hooks/use-act-training-page';
import type { ActStudio } from '../schemas';

interface ActTrainingPageBodyProps {
  page: ActTrainingPage;
  actId: number;
  studio: ActStudio;
}

const FREE_KEY = 'free';

export const ActTrainingPageBody: FC<ActTrainingPageBodyProps> = ({ page, actId, studio }) => {
  const goBackTo = useGoBackTo();
  const training =
    studio.trainings.find((candidate) => candidate.calendarEntryId === page.trainingId) ?? null;
  const screenKey = `${actId}:${training?.calendarEntryId ?? FREE_KEY}`;
  const close = (): void => {
    void goBackTo({ href: actPagePathOf(actId) });
  };

  return <HallBody key={screenKey} studio={studio} training={training} onClose={close} />;
};
