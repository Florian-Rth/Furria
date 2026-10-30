import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC } from 'react';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_SPOTS, STUDIO_SPOTS_CLOSE } from '../studio-copy';
import { ActStudioCastList } from './ActStudioCastList';

interface ActStudioSpotSheetProps {
  screen: StudioScreen;
  editor: ActStudioStage;
}

export const ActStudioSpotSheet: FC<ActStudioSpotSheetProps> = ({ screen, editor }) => (
  <KkPracticeSteps open={editor.sheetOpen} label={STUDIO_SPOTS} onClose={editor.closeSheet}>
    <KkPracticeSteps.Head>
      <KkPracticeSteps.Title text={STUDIO_SPOTS} />
      <KkPracticeSteps.Close label={STUDIO_SPOTS_CLOSE} onClose={editor.closeSheet} />
    </KkPracticeSteps.Head>
    <KkPracticeSteps.List>
      <ActStudioCastList screen={screen} editor={editor} />
    </KkPracticeSteps.List>
  </KkPracticeSteps>
);
