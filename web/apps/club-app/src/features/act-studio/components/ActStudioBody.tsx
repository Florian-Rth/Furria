import { KkPracticeView } from '@furria/ui/KkPracticeView';
import { KkStudioView } from '@furria/ui/KkStudioView';
import type { FC } from 'react';
import { PracticeSteps } from '@/features/act-practice/components/PracticeSteps';
import type { Studio } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import { useActStudioFinal } from '../hooks/use-act-studio-final';
import { useActStudioSongs } from '../hooks/use-act-studio-songs';
import { useActStudioStage } from '../hooks/use-act-studio-stage';
import { useActStudioStepTool } from '../hooks/use-act-studio-step-tool';
import { useActStudioTakes } from '../hooks/use-act-studio-takes';
import type { StudioEveningContext } from '../hooks/use-studio-screen';
import { useStudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_LABEL } from '../studio-copy';
import { ActStudioControls } from './ActStudioControls';
import { ActStudioFinalDesk } from './ActStudioFinalDesk';
import { ActStudioHead } from './ActStudioHead';
import { ActStudioHero } from './ActStudioHero';
import { ActStudioSide } from './ActStudioSide';
import { ActStudioSongDesk } from './ActStudioSongDesk';
import { ActStudioSpotSheet } from './ActStudioSpotSheet';
import { ActStudioStepDesk } from './ActStudioStepDesk';
import { ActStudioToolTabs } from './ActStudioToolTabs';
import { ActStudioVideoDesk } from './ActStudioVideoDesk';

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
  const takes = useActStudioTakes(screen);
  const songs = useActStudioSongs(screen);
  const finalList = useActStudioFinal(screen);
  const stepTool = useActStudioStepTool(screen);

  return (
    <KkStudioView label={STUDIO_LABEL} editing={screen.mode.editing}>
      <ActStudioHead screen={screen} />
      <KkPracticeView.Hero>
        <ActStudioHero screen={screen} editor={editor} />
      </KkPracticeView.Hero>
      <KkPracticeView.Side>
        <ActStudioSide
          screen={screen}
          editor={editor}
          takes={takes}
          songs={songs}
          finalList={finalList}
          stepTool={stepTool}
        />
      </KkPracticeView.Side>
      <KkPracticeView.Controls>
        <ActStudioControls screen={screen} editor={editor} takes={takes} stepTool={stepTool} />
      </KkPracticeView.Controls>
      <KkStudioView.Tools>
        <ActStudioToolTabs mode={screen.mode} />
      </KkStudioView.Tools>
      <PracticeSteps steps={screen.steps} />
      <ActStudioSpotSheet screen={screen} editor={editor} />
      <ActStudioSongDesk screen={screen} songs={songs} />
      <ActStudioFinalDesk screen={screen} finalList={finalList} />
      <ActStudioStepDesk screen={screen} tool={stepTool} />
      <ActStudioVideoDesk screen={screen} takes={takes} />
    </KkStudioView>
  );
};
