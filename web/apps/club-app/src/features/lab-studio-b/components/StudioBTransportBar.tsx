import { KkStudioBTransport } from '@furria/ui/KkStudioBTransport';
import type { FC } from 'react';
import { useStudioB } from '../studio-b-context';
import {
  FASTER_LABEL,
  LOOP_PART_LABEL,
  LOOP_STEP_LABEL,
  MIRRORED_LABEL,
  PAUSE_LABEL,
  PLAY_LABEL,
  SLOWER_LABEL,
  SPEED_LABEL,
  TRANSPORT_LABEL,
} from '../studio-b-copy';
import { percentOf } from '../studio-b-format';
import { StudioBLiveClock } from './StudioBLiveClock';
import { StudioBLiveStrip } from './StudioBLiveStrip';
import { StudioBMusicNote } from './StudioBMusicNote';

const SPEED_SPACER = { ml: 'auto' } as const;

export const StudioBTransportBar: FC = () => {
  const { playback, practice } = useStudioB();
  const { state } = playback;
  const { actions } = practice;
  const loading = state.load === 'idle' || state.load === 'loading';
  const resting = state.load !== 'ready';
  const loopingStep = practice.scope === 'step';
  const loopingPart = practice.scope === 'part';
  const noStep = practice.current === null;
  const noPart = (practice.currentPart?.partId ?? null) === null;
  const speed = percentOf(state.rate);
  const slowed = state.rate < 1;

  return (
    <KkStudioBTransport label={TRANSPORT_LABEL}>
      <KkStudioBTransport.Bar>
        <StudioBLiveClock />
        <StudioBLiveStrip />
        <KkStudioBTransport.Toggle
          kind="mirror"
          label={MIRRORED_LABEL}
          labelShown="wide"
          pressed={practice.mirrored}
          onToggle={actions.toggleMirror}
        />
      </KkStudioBTransport.Bar>
      <StudioBMusicNote />
      <KkStudioBTransport.Bar>
        <KkStudioBTransport.Play
          playing={state.playing}
          loading={loading}
          disabled={resting}
          playLabel={PLAY_LABEL}
          pauseLabel={PAUSE_LABEL}
          onToggle={actions.toggle}
        />
        <KkStudioBTransport.Toggle
          kind="loopStep"
          label={LOOP_STEP_LABEL}
          pressed={loopingStep}
          disabled={noStep}
          onToggle={actions.toggleStepLoop}
        />
        <KkStudioBTransport.Toggle
          kind="loopPart"
          label={LOOP_PART_LABEL}
          pressed={loopingPart}
          disabled={noPart}
          onToggle={actions.togglePartLoop}
        />
        <KkStudioBTransport.Bar sx={SPEED_SPACER}>
          <KkStudioBTransport.Speed
            value={speed}
            slowed={slowed}
            label={SPEED_LABEL}
            slowerLabel={SLOWER_LABEL}
            fasterLabel={FASTER_LABEL}
            canSlow={practice.canSlow}
            canSpeed={practice.canSpeed}
            onSlower={actions.slower}
            onFaster={actions.faster}
          />
        </KkStudioBTransport.Bar>
      </KkStudioBTransport.Bar>
    </KkStudioBTransport>
  );
};
