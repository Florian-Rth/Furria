import { ActStudioFinalDeskBody } from '@furria/studio/ActStudioFinalDeskBody';
import { finalDeskLabelOf, STUDIO_FINAL_DESK_CLOSE } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioFinal } from '@furria/studio/use-act-studio-final';
import { useFinalDesk } from '@furria/studio/use-final-desk';
import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC } from 'react';

interface ActStudioFinalDeskProps {
  screen: StudioScreen;
  finalList: ActStudioFinal;
}

export const ActStudioFinalDesk: FC<ActStudioFinalDeskProps> = ({ screen, finalList }) => {
  const desk = useFinalDesk(screen, finalList);
  const label = finalDeskLabelOf(desk?.kind ?? finalList.desk);
  const title = desk?.title ?? label;
  const body = desk === null ? null : <ActStudioFinalDeskBody desk={desk} />;

  return (
    <KkPracticeSteps open={desk !== null} label={label} onClose={finalList.closeDesk}>
      <KkPracticeSteps.Head>
        <KkPracticeSteps.Title text={title} />
        <KkPracticeSteps.Close label={STUDIO_FINAL_DESK_CLOSE} onClose={finalList.closeDesk} />
      </KkPracticeSteps.Head>
      <KkPracticeSteps.List>{body}</KkPracticeSteps.List>
    </KkPracticeSteps>
  );
};
