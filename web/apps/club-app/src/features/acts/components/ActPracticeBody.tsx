import type { FC } from 'react';
import { ActStudioBody } from '@/features/act-studio/components/ActStudioBody';
import type { ActPageState } from '../hooks/use-act-page';
import { ActPageLoading } from './ActPageLoading';

interface ActPracticeBodyProps {
  page: ActPageState;
}

const SESSION_KEY = 'session';

export const ActPracticeBody: FC<ActPracticeBodyProps> = ({ page }) => {
  const studio = page.query.data?.studio;

  if (studio === undefined || studio === null || page.actId === null) {
    return <ActPageLoading page={page} />;
  }

  const screenKey = `${page.actId}:${page.evening?.eventId ?? SESSION_KEY}`;
  const startHall = (): void => {
    page.startTraining(undefined);
  };
  const context = {
    evening: page.evening,
    startEditing: page.startEditing,
    startHall: page.canEditStudio ? startHall : null,
  };

  return (
    <ActStudioBody
      key={screenKey}
      actId={page.actId}
      studio={studio}
      viewerId={page.viewerId}
      canEdit={page.canEditStudio}
      cast={page.eveningCast}
      context={context}
    />
  );
};
