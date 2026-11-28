import type { FC } from 'react';
import { ActStudioBody } from '@/features/act-studio/components/ActStudioBody';
import type { ActPracticePage } from '../hooks/use-act-practice-page';
import type { ActStudio } from '../schemas';

interface ActPracticeBodyProps {
  page: ActPracticePage;
  actId: number;
  studio: ActStudio;
}

export const ActPracticeBody: FC<ActPracticeBodyProps> = ({ page, actId, studio }) => {
  const tone = page.load.act?.group?.tone ?? null;
  const context = {
    startEditing: page.startEditing,
    toggleEditing: page.toggleEditing,
    stageEditor: true,
    tone,
  };

  return (
    <ActStudioBody
      key={actId}
      actId={actId}
      title={page.title}
      tone={tone}
      studio={studio}
      viewerId={page.load.viewerId}
      canEdit={page.load.canEditStudio}
      cast={page.load.act?.cast ?? []}
      context={context}
    />
  );
};
