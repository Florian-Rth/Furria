import { KkStudioFFrame } from '@furria/ui/KkStudioFFrame';
import type { FC } from 'react';
import type { Studio } from '@/features/acts/schemas';
import type { StudioFLesson } from '../hooks/use-studio-f-lesson';
import { STUDIO_F_FRAME_LABEL } from '../studio-f-copy';
import { StudioFMediaOverlay } from './StudioFMediaOverlay';
import { StudioFStageView } from './StudioFStageView';
import { StudioFVideoView } from './StudioFVideoView';

interface StudioFMediaProps {
  studio: Studio;
  lesson: StudioFLesson;
}

export const StudioFMedia: FC<StudioFMediaProps> = ({ studio, lesson }) => {
  const { playback, video, mirrored } = lesson;
  const showsVideo = lesson.view === 'video' && video !== null;
  const content = showsVideo ? (
    <StudioFVideoView player={playback.player} video={video} mirrored={mirrored} />
  ) : (
    <StudioFStageView playback={playback} spots={studio.spots} mirrored={mirrored} />
  );
  const tone = showsVideo ? 'film' : 'paper';
  const overlay = <StudioFMediaOverlay lesson={lesson} />;

  return (
    <KkStudioFFrame
      label={STUDIO_F_FRAME_LABEL}
      tone={tone}
      turn={lesson.mediaTurn}
      canPrevious={lesson.canPrevious}
      canNext={lesson.canNext}
      onPrevious={lesson.previous}
      onNext={lesson.next}
      overlay={overlay}
    >
      {content}
    </KkStudioFFrame>
  );
};
