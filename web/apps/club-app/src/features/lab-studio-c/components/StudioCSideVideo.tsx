import { KkStudioCView } from '@furria/ui/KkStudioCView';
import { useIsMobile } from '@furria/ui/use-is-mobile';
import type { FC } from 'react';
import type { Studio } from '@/features/acts/schemas';
import { useMomentVideo } from '../hooks/use-moment-video';
import type { StudioCDesk } from '../hooks/use-studio-c-desk';
import { STUDIO_C_NO_VIDEO, STUDIO_C_VIDEO_LABEL } from '../studio-c-copy';
import { StudioCVideoLayer } from './StudioCVideoLayer';

const SIDE_RATIO = 16 / 9;

interface StudioCSideVideoProps {
  desk: StudioCDesk;
  studio: Studio;
}

export const StudioCSideVideo: FC<StudioCSideVideoProps> = ({ desk, studio }) => {
  const isMobile = useIsMobile();
  const video = useMomentVideo(desk.playback, studio);
  const { player } = desk.playback;

  if (isMobile) {
    return null;
  }

  const content =
    video === null ? (
      <KkStudioCView.Empty text={STUDIO_C_NO_VIDEO} />
    ) : (
      <StudioCVideoLayer
        key={video.videoId}
        player={player}
        video={video}
        mirrored={desk.mirrored}
        fit="contain"
      />
    );

  return (
    <KkStudioCView label={STUDIO_C_VIDEO_LABEL}>
      <KkStudioCView.Main ratio={SIDE_RATIO}>{content}</KkStudioCView.Main>
    </KkStudioCView>
  );
};
