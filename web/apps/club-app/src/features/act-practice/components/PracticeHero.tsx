import type { KkPracticeScreenHintLine } from '@furria/ui/KkPracticeScreen';
import { KkPracticeScreen } from '@furria/ui/KkPracticeScreen';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import type { Practice } from '../hooks/use-practice';
import { usePracticeGestures } from '../hooks/use-practice-gestures';
import type { PracticeVideo } from '../hooks/use-practice-video';
import {
  PRACTICE_HINT_SIDES,
  PRACTICE_HINT_TAP,
  PRACTICE_MIRRORED,
  PRACTICE_VIDEO_TITLE,
} from '../practice-copy';
import { PracticeStageLayer } from './PracticeStageLayer';

const HINT_LINES: readonly KkPracticeScreenHintLine[] = [
  { key: 'tap', glyph: 'tap', text: PRACTICE_HINT_TAP },
  { key: 'sides', glyph: 'forward', text: PRACTICE_HINT_SIDES },
];

interface PracticeHeroProps {
  studio: Studio;
  playback: StudioPlayback;
  practice: Practice;
  video: PracticeVideo;
}

export const PracticeHero: FC<PracticeHeroProps> = ({ studio, playback, practice, video }) => {
  const gestures = usePracticeGestures(practice);
  const filmed = video.hero === 'video';
  const hinted = !practice.playing && practice.canPlay;
  const take =
    video.take === null ? null : (
      <KkPracticeScreen.Take
        text={video.take.text}
        label={video.take.label}
        onNext={video.take.next}
      />
    );

  return (
    <KkPracticeScreen label={PRACTICE_VIDEO_TITLE} fit="aspect" surface={gestures.surface}>
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
      <KkPracticeScreen.Layer shown={!filmed} tone="clear">
        <PracticeStageLayer studio={studio} playback={playback} />
      </KkPracticeScreen.Layer>
      <KkPracticeScreen.Hint lines={HINT_LINES} shown={hinted} />
      <KkPracticeScreen.Hud signal={gestures.signal} />
    </KkPracticeScreen>
  );
};
