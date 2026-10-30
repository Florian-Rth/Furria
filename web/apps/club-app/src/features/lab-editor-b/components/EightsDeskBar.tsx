import { KkEightsBar } from '@furria/ui/KkEightsBar';
import { KkPracticeTransport } from '@furria/ui/KkPracticeTransport';
import type { FC } from 'react';
import {
  EIGHTS_BACK,
  EIGHTS_BAR_LABEL,
  EIGHTS_FORWARD,
  EIGHTS_HISTORY,
  EIGHTS_REDO,
  EIGHTS_UNDO,
  EIGHTS_ZOOM_LABEL,
  ZOOM_OPTIONS,
} from '../eights-copy';
import { useEightsBar } from '../hooks/use-eights-bar';
import type { EightsStudio } from '../hooks/use-eights-studio';
import { EightsClockLive } from './EightsClockLive';

interface EightsDeskBarProps {
  eights: EightsStudio;
}

export const EightsDeskBar: FC<EightsDeskBarProps> = ({ eights }) => {
  const bar = useEightsBar(eights);
  const { practice, playback } = eights.screen;
  const { history } = eights;

  return (
    <KkEightsBar label={EIGHTS_BAR_LABEL}>
      <KkEightsBar.Progress
        text={bar.progressText}
        label={bar.progressLabel}
        segments={bar.segments}
        onPress={bar.openSetup}
      />
      <KkEightsBar.Zoom
        label={EIGHTS_ZOOM_LABEL}
        options={ZOOM_OPTIONS}
        value={eights.density}
        onChoose={bar.chooseZoom}
      />
      <KkEightsBar.Gap />
      <KkPracticeTransport.Skip
        direction="back"
        label={EIGHTS_BACK}
        disabled={!practice.canStep}
        onSkip={bar.back}
      />
      <KkPracticeTransport.Play
        playing={practice.playing}
        label={practice.playLabel}
        disabled={!practice.canPlay}
        onToggle={practice.toggle}
      />
      <KkPracticeTransport.Skip
        direction="forward"
        label={EIGHTS_FORWARD}
        disabled={!practice.canStep}
        onSkip={bar.forward}
      />
      <EightsClockLive playback={playback} />
      <KkEightsBar.Gap />
      <KkEightsBar.Tool
        glyph="undo"
        text={EIGHTS_UNDO}
        shortcut="Control+Z"
        disabled={!history.canUndo}
        onPress={history.undo}
      />
      <KkEightsBar.Tool
        glyph="redo"
        text={EIGHTS_REDO}
        shortcut="Control+Shift+Z"
        disabled={!history.canRedo}
        onPress={history.redo}
      />
      <KkEightsBar.Tool glyph="history" text={EIGHTS_HISTORY} onPress={bar.openHistory} />
    </KkEightsBar>
  );
};
