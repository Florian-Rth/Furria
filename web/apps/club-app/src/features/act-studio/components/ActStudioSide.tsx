import { KkPracticeScreen } from '@furria/ui/KkPracticeScreen';
import { KkStudioSide } from '@furria/ui/KkStudioSide';
import type { FC } from 'react';
import { PracticeStageLayer } from '@/features/act-practice/components/PracticeStageLayer';
import {
  noVideoEyebrowOf,
  PRACTICE_MIRRORED,
  PRACTICE_NO_VIDEO_NOTE,
  PRACTICE_SIDE_LABEL,
} from '@/features/act-practice/practice-copy';
import { useActStudioSideVideo } from '../hooks/use-act-studio-side-video';
import type { ActStudioSongs } from '../hooks/use-act-studio-songs';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import type { ActStudioStepTool } from '../hooks/use-act-studio-step-tool';
import type { ActStudioTakes } from '../hooks/use-act-studio-takes';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { ActStudioCastList } from './ActStudioCastList';
import { ActStudioSongList } from './ActStudioSongList';
import { ActStudioStepRail } from './ActStudioStepRail';
import { ActStudioTakeList } from './ActStudioTakeList';

interface ActStudioSideProps {
  screen: StudioScreen;
  editor: ActStudioStage;
  takes: ActStudioTakes;
  songs: ActStudioSongs;
  stepTool: ActStudioStepTool;
}

export const ActStudioSide: FC<ActStudioSideProps> = ({
  screen,
  editor,
  takes,
  songs,
  stepTool,
}) => {
  const { practice, frame, studio, playback, video } = screen;
  const sideVideo = useActStudioSideVideo(screen);
  const eyebrow = noVideoEyebrowOf(practice.partName);
  const note = practice.note ?? PRACTICE_NO_VIDEO_NOTE;
  const filmedMedia = sideVideo.filmed ? (
    <>
      <KkPracticeScreen.Video
        source={video.source}
        videoRef={sideVideo.ref}
        mirrored={video.mirrored}
      />
      <KkPracticeScreen.Corner>
        <KkPracticeScreen.Mirror
          text={PRACTICE_MIRRORED}
          mirrored={video.mirrored}
          onToggle={video.toggleMirror}
        />
      </KkPracticeScreen.Corner>
    </>
  ) : (
    <KkPracticeScreen.Note eyebrow={eyebrow} text={note} />
  );
  const media = sideVideo.active ? filmedMedia : null;

  return (
    <KkPracticeScreen label={PRACTICE_SIDE_LABEL} fit="fill">
      <KkPracticeScreen.Layer shown={frame.side === 'stage'} tone="clear">
        <PracticeStageLayer studio={studio} playback={playback} />
      </KkPracticeScreen.Layer>
      <KkPracticeScreen.Layer shown={frame.side === 'note'} tone="clear">
        <KkPracticeScreen.Note eyebrow={eyebrow} text={note} />
      </KkPracticeScreen.Layer>
      <KkPracticeScreen.Layer shown={frame.side === 'songs'} tone="paper">
        <ActStudioSongList screen={screen} songs={songs} />
      </KkPracticeScreen.Layer>
      <KkPracticeScreen.Layer shown={frame.side === 'rail'} tone="paper">
        <ActStudioStepRail screen={screen} tool={stepTool} />
      </KkPracticeScreen.Layer>
      <KkPracticeScreen.Layer shown={frame.side === 'takes'} tone="paper">
        <ActStudioTakeList takes={takes} />
      </KkPracticeScreen.Layer>
      <KkPracticeScreen.Layer shown={frame.side === 'cast'} tone="clear">
        <KkStudioSide>
          <KkStudioSide.Media>{media}</KkStudioSide.Media>
          <KkStudioSide.Rest>
            <ActStudioCastList screen={screen} editor={editor} />
          </KkStudioSide.Rest>
        </KkStudioSide>
      </KkPracticeScreen.Layer>
    </KkPracticeScreen>
  );
};
