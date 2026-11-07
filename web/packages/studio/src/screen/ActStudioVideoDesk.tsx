import { ActStudioVideoDeskBody } from '@furria/studio/ActStudioVideoDeskBody';
import { STUDIO_VIDEO_DESK, STUDIO_VIDEO_DESK_CLOSE } from '@furria/studio/studio-copy';
import type { VideoDesk } from '@furria/studio/use-video-desk';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';

interface ActStudioVideoDeskProps {
  desk: VideoDesk;
  onClose: () => void;
}

export const ActStudioVideoDesk: FC<ActStudioVideoDeskProps> = ({ desk, onClose }) => (
  <KkLaneInspector>
    <KkLaneInspector.Top>
      <KkLaneInspector.Head eyebrow={STUDIO_VIDEO_DESK} title={desk.title} />
      <KkLaneInspector.Close label={STUDIO_VIDEO_DESK_CLOSE} onClose={onClose} />
    </KkLaneInspector.Top>
    <ActStudioVideoDeskBody desk={desk} />
  </KkLaneInspector>
);
