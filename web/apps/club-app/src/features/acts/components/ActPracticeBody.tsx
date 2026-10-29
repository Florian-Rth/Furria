import type { FC } from 'react';
import { PracticeBody } from '@/features/act-practice/components/PracticeBody';
import type { ActPageState } from '../hooks/use-act-page';
import { ActPageLoading } from './ActPageLoading';

interface ActPracticeBodyProps {
  page: ActPageState;
}

export const ActPracticeBody: FC<ActPracticeBodyProps> = ({ page }) => {
  const studio = page.query.data?.studio;

  if (studio === undefined || studio === null || page.actId === null) {
    return <ActPageLoading page={page} />;
  }

  return (
    <PracticeBody key={page.actId} actId={page.actId} studio={studio} viewerId={page.viewerId} />
  );
};
