import { KkStudioATransport } from '@furria/ui/KkStudioATransport';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { StudioAPractice } from '../hooks/use-studio-a-practice';
import { useStudioATransport } from '../hooks/use-studio-a-transport';
import type { StudioAView } from '../hooks/use-studio-a-view';
import {
  STUDIO_A_DECK_LABEL,
  STUDIO_A_LOOP_PART,
  STUDIO_A_LOOP_PART_FULL,
  STUDIO_A_LOOP_STEP,
  STUDIO_A_MIRRORED,
  STUDIO_A_TEMPO,
} from '../studio-a-copy';

interface StudioATransportLayerProps {
  playback: StudioPlayback;
  practice: StudioAPractice;
  view: StudioAView;
}

export const StudioATransportLayer: FC<StudioATransportLayerProps> = ({
  playback,
  practice,
  view,
}) => {
  const transport = useStudioATransport(playback, practice);
  const { controls } = playback;

  return (
    <KkStudioATransport label={STUDIO_A_DECK_LABEL}>
      <KkStudioATransport.Row>
        <KkStudioATransport.Play
          label={transport.playLabel}
          playing={transport.playing}
          busy={transport.busy}
          disabled={!transport.playable}
          onToggle={controls.toggle}
        />
        <KkStudioATransport.Loop
          label={STUDIO_A_LOOP_STEP}
          pressed={transport.stepLooped}
          disabled={!transport.canLoopStep}
          grow
          glyph={false}
          onClick={practice.loopStep}
        />
        <KkStudioATransport.Loop
          label={STUDIO_A_LOOP_PART}
          name={STUDIO_A_LOOP_PART_FULL}
          pressed={transport.partLooped}
          disabled={!transport.canLoopPart}
          onClick={practice.loopPart}
        />
      </KkStudioATransport.Row>
      <KkStudioATransport.Row>
        <KkStudioATransport.Rates
          label={STUDIO_A_TEMPO}
          rates={transport.rates}
          value={transport.rate}
          onSelect={controls.setRate}
        />
        <KkStudioATransport.Toggle
          label={STUDIO_A_MIRRORED}
          glyph="mirror"
          pressed={view.mirrored}
          onClick={view.toggleMirror}
        />
      </KkStudioATransport.Row>
    </KkStudioATransport>
  );
};
