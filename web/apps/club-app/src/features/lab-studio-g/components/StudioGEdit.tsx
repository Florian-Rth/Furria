import { KkStudioGDesk } from '@furria/ui/KkStudioGDesk';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Practice } from '@/features/act-practice/hooks/use-practice';
import type { PracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import type { Studio } from '@/features/acts/schemas';
import type { StudioGEdits } from '../hooks/use-studio-g-edits';
import { useStudioGSelection } from '../hooks/use-studio-g-selection';
import { STUDIO_G_DESK } from '../studio-g-copy';
import type { StudioGDesk } from '../studio-g-desk';
import { StudioGInspector } from './StudioGInspector';
import { StudioGTimeline } from './StudioGTimeline';
import { StudioGTransport } from './StudioGTransport';
import { StudioGViewer } from './StudioGViewer';

interface StudioGEditProps {
  actName: string;
  studio: Studio;
  playback: StudioPlayback;
  edits: StudioGEdits;
  practice: Practice;
  video: PracticeVideo;
}

export const StudioGEdit: FC<StudioGEditProps> = ({
  actName,
  studio,
  playback,
  edits,
  practice,
  video,
}) => {
  const picked = useStudioGSelection();
  const desk: StudioGDesk = { actName, studio, playback, edits, picked };

  return (
    <KkStudioGDesk label={STUDIO_G_DESK}>
      <KkStudioGDesk.Viewer>
        <StudioGViewer desk={desk} practice={practice} video={video} />
      </KkStudioGDesk.Viewer>
      <KkStudioGDesk.Transport>
        <StudioGTransport desk={desk} practice={practice} />
      </KkStudioGDesk.Transport>
      <KkStudioGDesk.Timeline>
        <StudioGTimeline desk={desk} />
      </KkStudioGDesk.Timeline>
      <KkStudioGDesk.Inspector>
        <StudioGInspector desk={desk} />
      </KkStudioGDesk.Inspector>
    </KkStudioGDesk>
  );
};
