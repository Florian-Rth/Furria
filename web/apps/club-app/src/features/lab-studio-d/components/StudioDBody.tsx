import { KkStudioDPlayer } from '@furria/ui/KkStudioDPlayer';
import type { FC } from 'react';
import type { Studio } from '@/features/acts/schemas';
import { useStudioDPlayer } from '../hooks/use-studio-d-player';
import {
  STUDIO_D_ALL_STEPS,
  STUDIO_D_CLOSE,
  STUDIO_D_LOAD_FAILED,
  STUDIO_D_LOOP_STEP,
  STUDIO_D_MIRRORED,
  STUDIO_D_PLAYER_LABEL,
  STUDIO_D_SEEK,
  STUDIO_D_TEMPO,
  STUDIO_D_VIDEO_LABEL,
} from '../studio-d-copy';
import { StudioDCount } from './StudioDCount';
import { StudioDProgressFill } from './StudioDProgressFill';
import { StudioDStageView } from './StudioDStageView';
import { StudioDStepsSheet } from './StudioDStepsSheet';

interface StudioDBodyProps {
  studio: Studio;
  title: string;
  eyebrow: string | null;
  viewerId: number | null;
  onClose: () => void;
}

export const StudioDBody: FC<StudioDBodyProps> = ({
  studio,
  title,
  eyebrow,
  viewerId,
  onClose,
}) => {
  const model = useStudioDPlayer(studio, viewerId);
  const { playback, view, practice, frame, stage, awake } = model;
  const { player, state } = playback;
  const { shows } = model;
  const note = model.failed ? (
    <KkStudioDPlayer.Note>{STUDIO_D_LOAD_FAILED}</KkStudioDPlayer.Note>
  ) : null;
  const currentStepId = practice.step?.stepId ?? null;

  return (
    <KkStudioDPlayer
      label={STUDIO_D_PLAYER_LABEL}
      awake={awake.shown}
      onSurfaceTap={awake.tapSurface}
    >
      <KkStudioDPlayer.Frame shown={shows.fullVideo}>
        <KkStudioDPlayer.Video
          label={STUDIO_D_VIDEO_LABEL}
          source={frame.source}
          videoRef={frame.fullRef}
          mirrored={view.mirrored}
        />
      </KkStudioDPlayer.Frame>
      <KkStudioDPlayer.Frame shown={shows.fullStage}>
        <KkStudioDPlayer.StageArea>
          <StudioDStageView player={player} view={stage} size="full" />
        </KkStudioDPlayer.StageArea>
      </KkStudioDPlayer.Frame>
      <KkStudioDPlayer.Inset
        label={model.insetLabel}
        shown={shows.inset}
        aspect={stage.aspect}
        onSwap={model.swap}
      >
        <KkStudioDPlayer.Frame shown={shows.insetStage}>
          <StudioDStageView player={player} view={stage} size="inset" />
        </KkStudioDPlayer.Frame>
        <KkStudioDPlayer.Frame shown={shows.insetVideo}>
          <KkStudioDPlayer.Video
            label={STUDIO_D_VIDEO_LABEL}
            source={frame.source}
            videoRef={frame.insetRef}
            mirrored={view.mirrored}
          />
        </KkStudioDPlayer.Frame>
      </KkStudioDPlayer.Inset>
      <KkStudioDPlayer.Top>
        <KkStudioDPlayer.Close label={STUDIO_D_CLOSE} onClose={onClose} />
        <KkStudioDPlayer.Title eyebrow={eyebrow} title={title} />
      </KkStudioDPlayer.Top>
      <KkStudioDPlayer.Play
        label={model.playLabel}
        playing={state.playing}
        busy={model.busy}
        disabled={model.locked}
        onToggle={model.toggle}
      />
      {note}
      <KkStudioDPlayer.Caption>
        <StudioDCount player={player} marks={playback.countMarks} />
        <KkStudioDPlayer.Step
          label={STUDIO_D_ALL_STEPS}
          part={practice.partName}
          name={model.stepName}
          onOpen={model.openSteps}
        />
      </KkStudioDPlayer.Caption>
      <KkStudioDPlayer.Bar>
        <KkStudioDPlayer.Progress
          label={STUDIO_D_SEEK}
          marks={practice.marks}
          loop={practice.loop}
          onSeek={model.seekShare}
        >
          <StudioDProgressFill player={player} length={playback.length} />
        </KkStudioDPlayer.Progress>
        <KkStudioDPlayer.Tools>
          <KkStudioDPlayer.Tool
            label={STUDIO_D_LOOP_STEP}
            glyph="loop"
            active={practice.looping}
            spoken
            accent
            disabled={model.stepless}
            onToggle={model.toggleLoop}
          />
          <KkStudioDPlayer.Speed
            label={STUDIO_D_TEMPO}
            options={model.speedOptions}
            value={state.rate}
            open={view.speedOpen}
            onOpenChange={view.setSpeedOpen}
            onChange={model.setRate}
          />
          <KkStudioDPlayer.Tool
            label={STUDIO_D_MIRRORED}
            glyph="mirror"
            active={view.mirrored}
            onToggle={model.toggleMirror}
          />
        </KkStudioDPlayer.Tools>
      </KkStudioDPlayer.Bar>
      <StudioDStepsSheet
        open={view.stepsOpen}
        groups={practice.groups}
        currentStepId={currentStepId}
        onClose={model.closeSteps}
        onPractise={practice.practise}
      />
    </KkStudioDPlayer>
  );
};
