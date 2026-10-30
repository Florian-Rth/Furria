import type { FC } from 'react';
import { ActTrainingBody } from '@/features/act-training/components/ActTrainingBody';
import type { ActPageState } from '../hooks/use-act-page';
import { ActPageLoading } from './ActPageLoading';

interface ActTrainingPageBodyProps {
  page: ActPageState;
}

const FREE_KEY = 'free';

export const ActTrainingPageBody: FC<ActTrainingPageBodyProps> = ({ page }) => {
  const studio = page.query.data?.studio;

  if (studio === undefined || studio === null || page.actId === null) {
    return <ActPageLoading page={page} />;
  }

  const screenKey = `${page.actId}:${page.training?.calendarEntryId ?? FREE_KEY}`;

  return <ActTrainingBody key={screenKey} studio={studio} training={page.training} />;
};
