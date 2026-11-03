import { ActStudioArrangeDesk } from '@furria/studio/ActStudioArrangeDesk';
import { ActStudioCastList } from '@furria/studio/ActStudioCastList';
import { ActStudioMoveDesk } from '@furria/studio/ActStudioMoveDesk';
import { ActStudioSpotDesk } from '@furria/studio/ActStudioSpotDesk';
import { STUDIO_ARRANGE, STUDIO_MOVE_DESK, STUDIO_SPOTS_CLOSE } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { useActStudioSpotDesk } from '@furria/studio/use-act-studio-spot-desk';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC } from 'react';

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
