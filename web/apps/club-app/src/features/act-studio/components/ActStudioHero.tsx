import type { KkPracticeScreenHintLine } from '@furria/ui/KkPracticeScreen';
import { KkPracticeScreen } from '@furria/ui/KkPracticeScreen';
import type { FC } from 'react';
import { PracticeStageLayer } from '@/features/act-practice/components/PracticeStageLayer';
import { usePracticeGestures } from '@/features/act-practice/hooks/use-practice-gestures';
import {
  PRACTICE_HINT_SIDES,
  PRACTICE_HINT_TAP,
  PRACTICE_MIRRORED,
  PRACTICE_VIDEO_TITLE,
} from '@/features/act-practice/practice-copy';
import { useStudioHints } from '../hooks/use-studio-hints';
import type { StudioScreen } from '../hooks/use-studio-screen';

const HINT_LINES: readonly KkPracticeScreenHintLine[] = [
  { key: 'tap', glyph: 'tap', text: PRACTICE_HINT_TAP },
  { key: 'sides', glyph: 'forward', text: PRACTICE_HINT_SIDES },
];

interface ActStudioHeroProps {
  screen: StudioScreen;
}

export const ActStudioHero: FC<ActStudioHeroProps> = ({ screen }) => {
  const { practice, video, frame, studio, playback } = screen;
  const gestures = usePracticeGestures(practice);
  const hinted = useStudioHints(screen);
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
      <KkPracticeScreen.Layer shown={frame.hero === 'video'} tone="ink">
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
      <KkPracticeScreen.Layer shown={frame.hero === 'stage'} tone="clear">
        <PracticeStageLayer studio={studio} playback={playback} />
      </KkPracticeScreen.Layer>
      <KkPracticeScreen.Hint lines={HINT_LINES} shown={hinted} />
      <KkPracticeScreen.Hud signal={gestures.signal} />
    </KkPracticeScreen>
  );
};
