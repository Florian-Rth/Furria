import { KkPracticeKeys } from '@furria/ui/KkPracticeKeys';
import type { FC } from 'react';
import {
  PRACTICE_LARGE_KEYS_LABEL,
  PRACTICE_STEP_BACK,
  PRACTICE_STEP_FORWARD,
  PRACTICE_VIDEO_SHOW,
  PRACTICE_VIDEO_SHOW_LABEL,
} from '@/features/act-practice/practice-copy';
import type { StudioScreen } from '../hooks/use-studio-screen';

interface ActStudioLargeKeysProps {
  screen: StudioScreen;
}

export const ActStudioLargeKeys: FC<ActStudioLargeKeysProps> = ({ screen }) => {
  const { practice, video, large } = screen;
  const stepless = !practice.canStep;
  const filmless = video.hero !== 'video';
  const back = (): void => {
    practice.skip('back');
  };
  const forward = (): void => {
    practice.skip('forward');
  };

  return (
    <KkPracticeKeys label={PRACTICE_LARGE_KEYS_LABEL}>
      <KkPracticeKeys.Play
        playing={practice.playing}
        caption={practice.playLabel}
        disabled={!practice.canPlay}
        onToggle={practice.toggle}
      />
      <KkPracticeKeys.Grid>
        <KkPracticeKeys.Key
          glyph="back"
          caption={PRACTICE_STEP_BACK}
          disabled={stepless}
          onPress={back}
        />
        <KkPracticeKeys.Key
          glyph="forward"
          caption={PRACTICE_STEP_FORWARD}
          disabled={stepless}
          onPress={forward}
        />
        <KkPracticeKeys.Key
          glyph="tempo"
          caption={practice.rateText}
          label={practice.rateLabel}
          pressed={practice.slowed}
          onPress={practice.slowDown}
        />
        <KkPracticeKeys.Key
          glyph="video"
          caption={PRACTICE_VIDEO_SHOW}
          label={PRACTICE_VIDEO_SHOW_LABEL}
          pressed={large.videoShown && !filmless}
          disabled={filmless}
          onPress={large.toggleVideo}
        />
      </KkPracticeKeys.Grid>
    </KkPracticeKeys>
  );
};
