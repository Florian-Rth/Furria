import { KkEightsBar } from '@furria/ui/KkEightsBar';
import { KkEightsFrame } from '@furria/ui/KkEightsFrame';
import { KkEightsReel } from '@furria/ui/KkEightsReel';
import { KkEightsSheet } from '@furria/ui/KkEightsSheet';
import { KkPracticeTransport } from '@furria/ui/KkPracticeTransport';
import type { FC } from 'react';
import {
  EIGHTS_BACK,
  EIGHTS_BAR_LABEL,
  EIGHTS_FORWARD,
  EIGHTS_HISTORY,
  EIGHTS_NO_STEPS,
  EIGHTS_REDO,
  EIGHTS_REEL_LABEL,
  EIGHTS_TRANSPORT,
} from '../eights-copy';
import { useEightsBar } from '../hooks/use-eights-bar';
import { useEightsReel } from '../hooks/use-eights-reel';
import { useEightsStageTools } from '../hooks/use-eights-stage-tools';
import type { EightsStudio } from '../hooks/use-eights-studio';
import { EightsCard } from './EightsCard';
import { EightsClockLive } from './EightsClockLive';

interface EightsPhoneProps {
  eights: EightsStudio;
}

export const EightsPhone: FC<EightsPhoneProps> = ({ eights }) => {
  const bar = useEightsBar(eights);
  const reel = useEightsReel(eights);
  const tools = useEightsStageTools(eights);
  const { practice, playback } = eights.screen;
  const { history } = eights;
  const cards = reel.cards.map((card) => (
    <EightsCard key={card.key} card={card} eights={eights} tools={tools} onSeek={reel.seek} />
  ));
  const empty = reel.cards.length === 0 ? <KkEightsSheet.Empty text={EIGHTS_NO_STEPS} /> : null;

  return (
    <>
      <KkEightsFrame.Area area="bar">
        <KkEightsBar label={EIGHTS_BAR_LABEL}>
          <KkEightsBar.Progress
            text={bar.progressText}
            label={bar.progressLabel}
            segments={bar.segments}
            onPress={bar.openSetup}
          />
          <KkEightsBar.Gap />
          <KkEightsBar.Tool
            glyph="redo"
            text={EIGHTS_REDO}
            textHidden
            disabled={!history.canRedo}
            onPress={history.redo}
          />
          <KkEightsBar.Tool glyph="history" text={EIGHTS_HISTORY} onPress={bar.openHistory} />
        </KkEightsBar>
      </KkEightsFrame.Area>
      <KkEightsFrame.Area area="main">
        <KkEightsReel label={EIGHTS_REEL_LABEL} index={reel.index} onIndex={reel.choose}>
          {cards}
        </KkEightsReel>
        {empty}
      </KkEightsFrame.Area>
      <KkEightsFrame.Area area="foot">
        <KkPracticeTransport label={EIGHTS_TRANSPORT}>
          <KkPracticeTransport.Pill>
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
            <KkPracticeTransport.Divider />
            <EightsClockLive playback={playback} />
          </KkPracticeTransport.Pill>
        </KkPracticeTransport>
      </KkEightsFrame.Area>
    </>
  );
};
