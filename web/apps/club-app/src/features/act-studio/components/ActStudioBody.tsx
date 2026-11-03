import { LessonBody } from '@furria/studio/LessonBody';
import { LessonEmpty } from '@furria/studio/LessonEmpty';
import { PracticeSteps } from '@furria/studio/PracticeSteps';
import type { KkGroupTone } from '@furria/ui/group-tone';
import { KkPracticeView } from '@furria/ui/KkPracticeView';
import { KkStudioView } from '@furria/ui/KkStudioView';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { FC } from 'react';
import { ActDeskView } from '@/features/act-desk/components/ActDeskView';
import { canPractise } from '@/features/acts/act-studio';
import type { ActStudio } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import { useActStudioStage } from '../hooks/use-act-studio-stage';
import type { StudioEveningContext } from '../hooks/use-studio-screen';
import { useStudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_LABEL } from '../studio-copy';
import { ActStudioHead } from './ActStudioHead';
import { ActStudioHero } from './ActStudioHero';
import { ActStudioLargeKeys } from './ActStudioLargeKeys';
import { StepCardsView } from './StepCardsView';

interface ActStudioBodyProps {
  actId: number;
  title: string;
  tone: KkGroupTone | null;
  studio: ActStudio;
  viewerId: number | null;
  canEdit: boolean;
  cast: readonly CastPerson[];
  context: StudioEveningContext;
}

export const ActStudioBody: FC<ActStudioBodyProps> = ({
  actId,
  title,
  tone,
  studio,
  viewerId,
  canEdit,
  cast,
  context,
}) => {
  const screen = useStudioScreen(actId, studio, viewerId, canEdit, cast, context);
  const editor = useActStudioStage(screen);

  const heading = <KkVisuallyHidden component="h1">{title}</KkVisuallyHidden>;

  if (screen.editor === 'cards') {
    return (
      <>
        {heading}
        <StepCardsView screen={screen} editor={editor} />
      </>
    );
  }
  if (screen.editor === 'desk') {
    return (
      <>
        {heading}
        <ActDeskView screen={screen} editor={editor} />
      </>
    );
  }

  if (!screen.mode.editing && !canPractise(screen.studio)) {
    return <LessonEmpty title={title} mode={screen.mode} />;
  }
  if (!screen.large.on) {
    return <LessonBody title={title} tone={tone} screen={screen} />;
  }

  return (
    <KkStudioView label={STUDIO_LABEL} title={title} editing={false} largeText>
      <ActStudioHead screen={screen} />
      <KkPracticeView.Hero>
        <ActStudioHero screen={screen} />
      </KkPracticeView.Hero>
      <KkPracticeView.Controls>
        <ActStudioLargeKeys screen={screen} />
      </KkPracticeView.Controls>
      <PracticeSteps steps={screen.steps} onTraining={screen.startHall} />
    </KkStudioView>
  );
};
