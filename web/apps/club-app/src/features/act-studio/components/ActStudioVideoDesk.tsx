import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC } from 'react';
import type { ActStudioTakes } from '../hooks/use-act-studio-takes';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { useVideoDesk } from '../hooks/use-video-desk';
import { STUDIO_VIDEO_DESK, STUDIO_VIDEO_DESK_CLOSE } from '../studio-copy';
import { ActStudioVideoDeskBody } from './ActStudioVideoDeskBody';

interface ActStudioVideoDeskProps {
  screen: StudioScreen;
  takes: ActStudioTakes;
}

export const ActStudioVideoDesk: FC<ActStudioVideoDeskProps> = ({ screen, takes }) => {
  const desk = useVideoDesk(screen, takes);
  const open = takes.deskOpen && desk !== null;
  const title = desk?.title ?? STUDIO_VIDEO_DESK;
  const body = desk === null ? null : <ActStudioVideoDeskBody desk={desk} />;
  const close = (): void => {
    desk?.commitName();
    takes.closeDesk();
  };

  return (
    <KkPracticeSteps open={open} label={STUDIO_VIDEO_DESK} onClose={close}>
      <KkPracticeSteps.Head>
        <KkPracticeSteps.Title text={title} />
        <KkPracticeSteps.Close label={STUDIO_VIDEO_DESK_CLOSE} onClose={close} />
      </KkPracticeSteps.Head>
      <KkPracticeSteps.List>{body}</KkPracticeSteps.List>
    </KkPracticeSteps>
  );
};
