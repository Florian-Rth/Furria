import type { FC } from 'react';
import { HallBody } from '@/features/act-hall/components/HallBody';
import { hallTrainingOf } from '@/features/act-hall/hall-scene';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { actPagePathOf } from '../acts-origin';
import type { ActPageState } from '../hooks/use-act-page';
import { ActPageLoading } from './ActPageLoading';

interface ActTrainingPageBodyProps {
  page: ActPageState;
}

const FREE_KEY = 'free';

export const ActTrainingPageBody: FC<ActTrainingPageBodyProps> = ({ page }) => {
  const goBackTo = useGoBackTo();
  const studio = page.query.data?.studio;
  const { actId } = page;

  if (studio === undefined || studio === null || actId === null) {
    return <ActPageLoading page={page} />;
  }

  const training = hallTrainingOf(studio.trainings, page.training?.calendarEntryId);
  const screenKey = `${actId}:${training?.calendarEntryId ?? FREE_KEY}`;
  const close = (): void => {
    void goBackTo({ href: actPagePathOf(actId) });
  };

  return <HallBody key={screenKey} studio={studio} training={training} onClose={close} />;
};
