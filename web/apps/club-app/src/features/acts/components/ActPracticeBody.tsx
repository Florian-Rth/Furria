import type { FC } from 'react';
import { ActStudioBody } from '@/features/act-studio/components/ActStudioBody';
import type { ActPageState } from '../hooks/use-act-page';
import { ActPageLoading } from './ActPageLoading';

interface ActPracticeBodyProps {
  page: ActPageState;
}

export const ActPracticeBody: FC<ActPracticeBodyProps> = ({ page }) => {
  const studio = page.query.data?.studio;
  const cast = page.query.data?.act.cast ?? [];

  if (studio === undefined || studio === null || page.actId === null) {
    return <ActPageLoading page={page} />;
  }

  return (
    <ActStudioBody
      key={page.actId}
      actId={page.actId}
      studio={studio}
      viewerId={page.viewerId}
      canEdit={page.canEditStudio}
      cast={cast}
    />
  );
};
