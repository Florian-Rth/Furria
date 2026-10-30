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
import type { StudioH } from '../hooks/use-studio-h';
import type { StudioHStage } from '../hooks/use-studio-h-stage';
import { StudioHStageEditor } from './StudioHStageEditor';
import { StudioHWaveLayer } from './StudioHWaveLayer';

const HINT_LINES: readonly KkPracticeScreenHintLine[] = [
  { key: 'tap', glyph: 'tap', text: PRACTICE_HINT_TAP },
  { key: 'sides', glyph: 'forward', text: PRACTICE_HINT_SIDES },
];

interface StudioHHeroProps {
  h: StudioH;
  editor: StudioHStage;
}

export const StudioHHero: FC<StudioHHeroProps> = ({ h, editor }) => {
  const { practice, video, frame, mode, studio, playback } = h;
  const gestures = usePracticeGestures(practice);
  const surface = mode.editing ? undefined : gestures.surface;
  const hinted = !mode.editing && !practice.playing && practice.canPlay;
  const take =
    video.take === null ? null : (
      <KkPracticeScreen.Take
        text={video.take.text}
        label={video.take.label}
        onNext={video.take.next}
      />
    );

  return (
    <KkPracticeScreen label={PRACTICE_VIDEO_TITLE} fit="aspect" surface={surface}>
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
      <KkPracticeScreen.Layer shown={frame.hero === 'wave'} tone="paper">
        <StudioHWaveLayer h={h} />
      </KkPracticeScreen.Layer>
      <KkPracticeScreen.Layer shown={frame.hero === 'editor'} tone="clear">
        <StudioHStageEditor h={h} editor={editor} />
      </KkPracticeScreen.Layer>
      <KkPracticeScreen.Hint lines={HINT_LINES} shown={hinted} />
      <KkPracticeScreen.Hud signal={gestures.signal} />
    </KkPracticeScreen>
  );
};
