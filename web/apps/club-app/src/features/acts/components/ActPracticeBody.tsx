import type { FC } from 'react';
import { ActStudioBody } from '@/features/act-studio/components/ActStudioBody';
import type { ActPracticePage } from '../hooks/use-act-practice-page';
import type { ActStudio } from '../schemas';

interface ActPracticeBodyProps {
  page: ActPracticePage;
  actId: number;
  studio: ActStudio;
}

const SESSION_KEY = 'session';

export const ActPracticeBody: FC<ActPracticeBodyProps> = ({ page, actId, studio }) => {
  const tone = page.load.act?.group?.tone ?? null;
  const screenKey = `${actId}:${page.evening?.eventId ?? SESSION_KEY}`;
  const context = {
    evening: page.evening,
    startEditing: page.startEditing,
    startHall: page.startHall,
    toggleEditing: page.toggleEditing,
    stageEditor: true,
    tone,
  };

  return (
    <ActStudioBody
      key={screenKey}
      actId={actId}
      title={page.title}
      tone={tone}
      studio={studio}
      viewerId={page.load.viewerId}
      canEdit={page.load.canEditStudio}
      cast={page.eveningCast}
      context={context}
    />
  );
};
