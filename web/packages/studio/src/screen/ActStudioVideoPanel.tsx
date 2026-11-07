import { ActStudioTakeList } from '@furria/studio/ActStudioTakeList';
import { ActStudioVideoDesk } from '@furria/studio/ActStudioVideoDesk';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioTakes } from '@furria/studio/use-act-studio-takes';
import { useVideoDesk } from '@furria/studio/use-video-desk';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';

interface ActStudioVideoPanelProps {
  screen: StudioScreen;
  takes: ActStudioTakes;
}

export const ActStudioVideoPanel: FC<ActStudioVideoPanelProps> = ({ screen, takes }) => {
  const desk = useVideoDesk(screen, takes);

  if (takes.deskOpen && desk !== null) {
    const close = (): void => {
      desk.commitName();
      takes.closeDesk();
    };

    return <ActStudioVideoDesk desk={desk} onClose={close} />;
  }

  return (
    <KkLaneInspector>
      <ActStudioTakeList screen={screen} takes={takes} />
    </KkLaneInspector>
  );
};
