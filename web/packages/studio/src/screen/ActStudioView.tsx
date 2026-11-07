import { ActStudioHead } from '@furria/studio/ActStudioHead';
import { ActStudioHero } from '@furria/studio/ActStudioHero';
import { ActStudioLargeKeys } from '@furria/studio/ActStudioLargeKeys';
import { LessonBody } from '@furria/studio/LessonBody';
import { LessonEmpty } from '@furria/studio/LessonEmpty';
import { canPractise } from '@furria/studio/music-timeline';
import { PracticeSteps } from '@furria/studio/PracticeSteps';
import { STUDIO_LABEL } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { KkGroupTone } from '@furria/ui/group-tone';
import { KkPracticeView } from '@furria/ui/KkPracticeView';
import { KkStudioView } from '@furria/ui/KkStudioView';
import type { FC } from 'react';

interface ActStudioViewProps {
  title: string;
  tone: KkGroupTone | null;
  screen: StudioScreen;
}

export const ActStudioView: FC<ActStudioViewProps> = ({ title, tone, screen }) => {
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
