import { KkPracticeView } from '@furria/ui/KkPracticeView';
import { KkStudioView } from '@furria/ui/KkStudioView';
import type { FC } from 'react';
import { ActDeskView } from '@/features/act-desk/components/ActDeskView';
import { PracticeSteps } from '@/features/act-practice/components/PracticeSteps';
import type { Studio } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import { useActStudioStage } from '../hooks/use-act-studio-stage';
import type { StudioEveningContext } from '../hooks/use-studio-screen';
import { useStudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_LABEL } from '../studio-copy';
import { ActStudioControls } from './ActStudioControls';
import { ActStudioHead } from './ActStudioHead';
import { ActStudioHero } from './ActStudioHero';
import { ActStudioLargeKeys } from './ActStudioLargeKeys';
import { ActStudioSide } from './ActStudioSide';
import { StepCardsView } from './StepCardsView';

interface ActStudioBodyProps {
  actId: number;
  studio: Studio;
  viewerId: number | null;
  canEdit: boolean;
  cast: readonly CastPerson[];
  context: StudioEveningContext;
}

export const ActStudioBody: FC<ActStudioBodyProps> = ({
  actId,
  studio,
  viewerId,
  canEdit,
  cast,
  context,
}) => {
  const screen = useStudioScreen(actId, studio, viewerId, canEdit, cast, context);
  const editor = useActStudioStage(screen);

  if (screen.editor === 'cards') {
    return <StepCardsView screen={screen} editor={editor} />;
  }
  if (screen.editor === 'desk') {
    return <ActDeskView screen={screen} editor={editor} />;
  }

  const side = screen.large.on ? null : (
    <KkPracticeView.Side>
      <ActStudioSide screen={screen} />
    </KkPracticeView.Side>
  );
  const controls = screen.large.on ? (
    <ActStudioLargeKeys screen={screen} />
  ) : (
    <ActStudioControls screen={screen} />
  );

  return (
    <KkStudioView label={STUDIO_LABEL} editing={false} largeText={screen.large.on}>
      <ActStudioHead screen={screen} />
      <KkPracticeView.Hero>
        <ActStudioHero screen={screen} />
      </KkPracticeView.Hero>
      {side}
      <KkPracticeView.Controls>{controls}</KkPracticeView.Controls>
      <PracticeSteps steps={screen.steps} onTraining={screen.startHall} />
    </KkStudioView>
  );
};
