import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC } from 'react';
import type { StudioH } from '../hooks/use-studio-h';
import type { StudioHStage } from '../hooks/use-studio-h-stage';
import { STUDIO_H_SPOTS, STUDIO_H_SPOTS_CLOSE } from '../studio-h-copy';
import { StudioHCastList } from './StudioHCastList';

interface StudioHSpotSheetProps {
  h: StudioH;
  editor: StudioHStage;
}

export const StudioHSpotSheet: FC<StudioHSpotSheetProps> = ({ h, editor }) => (
  <KkPracticeSteps open={editor.sheetOpen} label={STUDIO_H_SPOTS} onClose={editor.closeSheet}>
    <KkPracticeSteps.Head>
      <KkPracticeSteps.Title text={STUDIO_H_SPOTS} />
      <KkPracticeSteps.Close label={STUDIO_H_SPOTS_CLOSE} onClose={editor.closeSheet} />
    </KkPracticeSteps.Head>
    <KkPracticeSteps.List>
      <StudioHCastList h={h} editor={editor} />
    </KkPracticeSteps.List>
  </KkPracticeSteps>
);
