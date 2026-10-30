import { KkPracticeScreen } from '@furria/ui/KkPracticeScreen';
import { KkStudioHSide } from '@furria/ui/KkStudioHSide';
import type { FC } from 'react';
import { PracticeStageLayer } from '@/features/act-practice/components/PracticeStageLayer';
import {
  noVideoEyebrowOf,
  PRACTICE_MIRRORED,
  PRACTICE_NO_VIDEO_NOTE,
  PRACTICE_SIDE_LABEL,
} from '@/features/act-practice/practice-copy';
import type { StudioH } from '../hooks/use-studio-h';
import { useStudioHSideVideo } from '../hooks/use-studio-h-side-video';
import type { StudioHStage } from '../hooks/use-studio-h-stage';
import type { StudioHTakes } from '../hooks/use-studio-h-takes';
import { StudioHCastList } from './StudioHCastList';
import { StudioHSongList } from './StudioHSongList';
import { StudioHTakeList } from './StudioHTakeList';

interface StudioHSideProps {
  h: StudioH;
  editor: StudioHStage;
  takes: StudioHTakes;
}

export const StudioHSide: FC<StudioHSideProps> = ({ h, editor, takes }) => {
  const { practice, frame, studio, playback, video } = h;
  const sideVideo = useStudioHSideVideo(h);
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
        <StudioHSongList h={h} />
      </KkPracticeScreen.Layer>
      <KkPracticeScreen.Layer shown={frame.side === 'takes'} tone="paper">
        <StudioHTakeList takes={takes} />
      </KkPracticeScreen.Layer>
      <KkPracticeScreen.Layer shown={frame.side === 'cast'} tone="clear">
        <KkStudioHSide>
          <KkStudioHSide.Media>{media}</KkStudioHSide.Media>
          <KkStudioHSide.Rest>
            <StudioHCastList h={h} editor={editor} />
          </KkStudioHSide.Rest>
        </KkStudioHSide>
      </KkPracticeScreen.Layer>
    </KkPracticeScreen>
  );
};
