import type { FC } from 'react';
import { ActPageLoading } from '@/features/acts/components/ActPageLoading';
import type { ActPageState } from '@/features/acts/hooks/use-act-page';
import { StepSetupStudio } from './StepSetupStudio';

interface StepSetupBodyProps {
  page: ActPageState;
}

const ignore = (): void => undefined;

export const StepSetupBody: FC<StepSetupBodyProps> = ({ page }) => {
  const studio = page.query.data?.studio;

  if (studio === undefined || studio === null || page.actId === null) {
    return <ActPageLoading page={page} />;
  }

  const tone = page.query.data?.act.group?.tone ?? null;
  const context = {
    evening: null,
    startEditing: true,
    startHall: ignore,
    stageEditor: true,
    tone,
  };

  return (
    <StepSetupStudio
      key={page.actId}
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
