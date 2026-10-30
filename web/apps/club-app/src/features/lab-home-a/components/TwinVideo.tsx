import { KkPracticeScreen } from '@furria/ui/KkPracticeScreen';
import type { FC } from 'react';
import {
  noVideoEyebrowOf,
  PRACTICE_MIRRORED,
  PRACTICE_NO_VIDEO_NOTE,
  PRACTICE_VIDEO_TITLE,
} from '@/features/act-practice/practice-copy';
import type { TwinScreen } from '../hooks/use-twin-screen';

interface TwinVideoProps {
  screen: TwinScreen;
}

export const TwinVideo: FC<TwinVideoProps> = ({ screen }) => {
  const { video, gestures, practice } = screen;
  const filmed = video.hero === 'video';
  const unfilmedEyebrow = noVideoEyebrowOf(practice.partName);
  const take =
    video.take === null ? null : (
      <KkPracticeScreen.Take
        text={video.take.text}
        label={video.take.label}
        onNext={video.take.next}
      />
    );

  return (
    <KkPracticeScreen label={PRACTICE_VIDEO_TITLE} fit="fill" surface={gestures.surface}>
      <KkPracticeScreen.Layer shown={filmed} tone="ink">
        <KkPracticeScreen.Video
          source={video.source}
          videoRef={video.ref}
          mirrored={video.mirrored}
        />
        <KkPracticeScreen.Corner>
          {take}
          <KkPracticeScreen.Mirror
            text={PRACTICE_MIRRORED}
            mirrored={video.mirrored}
            onToggle={video.toggleMirror}
          />
        </KkPracticeScreen.Corner>
      </KkPracticeScreen.Layer>
      <KkPracticeScreen.Layer shown={!filmed} tone="paper">
        <KkPracticeScreen.Note eyebrow={unfilmedEyebrow} text={PRACTICE_NO_VIDEO_NOTE} />
      </KkPracticeScreen.Layer>
      <KkPracticeScreen.Hud signal={gestures.signal} />
    </KkPracticeScreen>
  );
};
