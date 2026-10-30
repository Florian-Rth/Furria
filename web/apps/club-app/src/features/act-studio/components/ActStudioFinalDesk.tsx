import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC } from 'react';
import type { ActStudioFinal } from '../hooks/use-act-studio-final';
import { useFinalDesk } from '../hooks/use-final-desk';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { finalDeskLabelOf, STUDIO_FINAL_DESK_CLOSE } from '../studio-copy';
import { ActStudioFinalDeskBody } from './ActStudioFinalDeskBody';

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
