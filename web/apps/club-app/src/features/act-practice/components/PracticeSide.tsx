import { KkPracticeScreen } from '@furria/ui/KkPracticeScreen';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import type { Practice } from '../hooks/use-practice';
import type { PracticeVideo } from '../hooks/use-practice-video';
import { noVideoEyebrowOf, PRACTICE_NO_VIDEO_NOTE, PRACTICE_SIDE_LABEL } from '../practice-copy';
import { PracticeStageLayer } from './PracticeStageLayer';

interface PracticeSideProps {
  studio: Studio;
  playback: StudioPlayback;
  practice: Practice;
  video: PracticeVideo;
}

export const PracticeSide: FC<PracticeSideProps> = ({ studio, playback, practice, video }) => {
  const filmed = video.hero === 'video';
  const eyebrow = noVideoEyebrowOf(practice.partName);
  const note = practice.note ?? PRACTICE_NO_VIDEO_NOTE;

  return (
    <KkPracticeScreen label={PRACTICE_SIDE_LABEL} fit="fill">
      <KkPracticeScreen.Layer shown={filmed} tone="clear">
        <PracticeStageLayer studio={studio} playback={playback} />
      </KkPracticeScreen.Layer>
      <KkPracticeScreen.Layer shown={!filmed} tone="clear">
        <KkPracticeScreen.Note eyebrow={eyebrow} text={note} />
      </KkPracticeScreen.Layer>
    </KkPracticeScreen>
  );
};
