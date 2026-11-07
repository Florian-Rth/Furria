import type { FC } from 'react';
import { ActPageLoading } from '@/features/acts/components/ActPageLoading';
import type { ActPageState } from '@/features/acts/hooks/use-act-page';
import { EditJobsStudio } from './EditJobsStudio';

interface EditJobsBodyProps {
  page: ActPageState;
}

const SESSION_KEY = 'session';

export const EditJobsBody: FC<EditJobsBodyProps> = ({ page }) => {
  const studio = page.query.data?.studio;

  if (studio === undefined || studio === null || page.actId === null) {
    return <ActPageLoading page={page} />;
  }

  const tone = page.query.data?.act.group?.tone ?? null;
  const screenKey = `${page.actId}:${page.evening?.eventId ?? SESSION_KEY}`;
  const startHall = (): void => {
    page.startTraining(undefined);
  };
  const context = {
    evening: page.evening,
    startEditing: true,
    startHall,
    stageEditor: true,
    tone,
  };

  return (
    <EditJobsStudio
      key={screenKey}
      actId={page.actId}
      title={page.title}
      tone={tone}
      studio={studio}
      viewerId={page.viewerId}
      canEdit={page.canEditStudio}
      cast={page.eveningCast}
      context={context}
    />
  );
};
