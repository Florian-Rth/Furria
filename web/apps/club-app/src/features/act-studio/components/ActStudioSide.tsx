import { KkPracticeScreen } from '@furria/ui/KkPracticeScreen';
import type { FC } from 'react';
import { PracticeStageLayer } from '@/features/act-practice/components/PracticeStageLayer';
import {
  noVideoEyebrowOf,
  PRACTICE_NO_VIDEO_NOTE,
  PRACTICE_SIDE_LABEL,
} from '@/features/act-practice/practice-copy';
import type { StudioScreen } from '../hooks/use-studio-screen';

interface ActStudioSideProps {
  screen: StudioScreen;
}

export const ActStudioSide: FC<ActStudioSideProps> = ({ screen }) => {
  const { practice, frame, studio, playback } = screen;
  const eyebrow = noVideoEyebrowOf(practice.partName);
  const note = practice.note ?? PRACTICE_NO_VIDEO_NOTE;

  return (
    <KkPracticeScreen label={PRACTICE_SIDE_LABEL} fit="fill">
      <KkPracticeScreen.Layer shown={frame.side === 'stage'} tone="clear">
        <PracticeStageLayer studio={studio} playback={playback} />
      </KkPracticeScreen.Layer>
      <KkPracticeScreen.Layer shown={frame.side === 'note'} tone="clear">
        <KkPracticeScreen.Note eyebrow={eyebrow} text={note} />
      </KkPracticeScreen.Layer>
    </KkPracticeScreen>
  );
};
