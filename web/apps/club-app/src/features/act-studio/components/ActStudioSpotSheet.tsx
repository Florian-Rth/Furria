import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC } from 'react';
import { useActStudioSpotDesk } from '../hooks/use-act-studio-spot-desk';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_ARRANGE, STUDIO_MOVE_DESK, STUDIO_SPOTS_CLOSE } from '../studio-copy';
import { ActStudioArrangeDesk } from './ActStudioArrangeDesk';
import { ActStudioCastList } from './ActStudioCastList';
import { ActStudioMoveDesk } from './ActStudioMoveDesk';
import { ActStudioSpotDesk } from './ActStudioSpotDesk';

interface ActStudioSpotSheetProps {
  screen: StudioScreen;
  editor: ActStudioStage;
}

export const ActStudioSpotSheet: FC<ActStudioSpotSheetProps> = ({ screen, editor }) => {
  const desk = useActStudioSpotDesk(screen, editor);
  const spotDesk = desk === null ? null : <ActStudioSpotDesk desk={desk} />;
  const label = editor.moving ? STUDIO_MOVE_DESK : STUDIO_ARRANGE;
  const title = desk?.title ?? label;
  const tools = editor.moving ? (
    <ActStudioMoveDesk movement={editor.movement} />
  ) : (
    <ActStudioArrangeDesk editor={editor} />
  );

  return (
    <KkPracticeSteps open={editor.sheetOpen} label={label} onClose={editor.closeSheet}>
      <KkPracticeSteps.Head>
        <KkPracticeSteps.Title text={title} />
        <KkPracticeSteps.Close label={STUDIO_SPOTS_CLOSE} onClose={editor.closeSheet} />
      </KkPracticeSteps.Head>
      <KkPracticeSteps.List>
        {spotDesk}
        {tools}
        <ActStudioCastList screen={screen} editor={editor} />
      </KkPracticeSteps.List>
    </KkPracticeSteps>
  );
};
