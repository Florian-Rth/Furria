import type { KkStudioEScreenHintLine } from '@furria/ui/KkStudioEScreen';
import { KkStudioEScreen } from '@furria/ui/KkStudioEScreen';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import { useStudioEGestures } from '../hooks/use-studio-e-gestures';
import type { StudioEPractice } from '../hooks/use-studio-e-practice';
import type { StudioEVideo } from '../hooks/use-studio-e-video';
import {
  STUDIO_E_HINT_SIDES,
  STUDIO_E_HINT_TAP,
  STUDIO_E_MIRRORED,
  STUDIO_E_VIDEO_TITLE,
} from '../studio-e-copy';
import { StudioEStageLayer } from './StudioEStageLayer';

const HINT_LINES: readonly KkStudioEScreenHintLine[] = [
  { key: 'tap', glyph: 'tap', text: STUDIO_E_HINT_TAP },
  { key: 'sides', glyph: 'forward', text: STUDIO_E_HINT_SIDES },
];

interface StudioEHeroProps {
  studio: Studio;
  playback: StudioPlayback;
  practice: StudioEPractice;
  video: StudioEVideo;
}

export const StudioEHero: FC<StudioEHeroProps> = ({ studio, playback, practice, video }) => {
  const gestures = useStudioEGestures(practice);
  const filmed = video.hero === 'video';
  const hinted = !practice.playing && practice.canPlay;

  return (
    <KkStudioEScreen label={STUDIO_E_VIDEO_TITLE} fit="aspect" surface={gestures.surface}>
      <KkStudioEScreen.Layer shown={filmed} tone="ink">
        <KkStudioEScreen.Video
          source={video.source}
          videoRef={video.ref}
          mirrored={video.mirrored}
        />
        <KkStudioEScreen.Corner>
          <KkStudioEScreen.Mirror
            text={STUDIO_E_MIRRORED}
            mirrored={video.mirrored}
            onToggle={video.toggleMirror}
          />
        </KkStudioEScreen.Corner>
      </KkStudioEScreen.Layer>
      <KkStudioEScreen.Layer shown={!filmed} tone="clear">
        <StudioEStageLayer studio={studio} playback={playback} />
      </KkStudioEScreen.Layer>
      <KkStudioEScreen.Hint lines={HINT_LINES} shown={hinted} />
      <KkStudioEScreen.Hud signal={gestures.signal} />
    </KkStudioEScreen>
  );
};
