import { KkWayStage } from '@furria/ui/KkWayStage';
import type { FC } from 'react';
import { cueTextOf } from '@/features/act-practice/practice-copy';
import type { StageScene } from '@/features/act-practice/practice-stage';
import type { WayScreen } from '../hooks/use-way-screen';
import { useWayStageFrame } from '../hooks/use-way-stage-frame';

interface WayStageLiveProps {
  screen: WayScreen;
}

export const WayStageLive: FC<WayStageLiveProps> = ({ screen }) => {
  const { playback, studio, ownPath, reach, near } = screen;
  const scene: StageScene = {
    paths: playback.paths,
    spots: studio.spots,
    ownSpotId: playback.ownSpotId,
    stage: playback.stage,
  };
  const frame = useWayStageFrame({
    player: playback.player,
    scene,
    ownPath,
    marks: playback.countMarks,
    loop: playback.state.loop,
    reach,
    near,
  });
  const gliding = !playback.state.playing;
  const aspect = playback.stage.depthMetres / playback.stage.widthMetres;
  const dots = frame.dots.map((dot) => (
    <KkWayStage.Dot
      key={dot.spotId}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      kind={dot.kind}
      turn={dot.turn}
      gliding={gliding}
    />
  ));
  const ticks = frame.ticks.map((tick) => (
    <KkWayStage.Tick key={tick.key} x={tick.x} y={tick.y} count={tick.count} />
  ));
  const cue =
    frame.cue === null || frame.own === null ? null : (
      <KkWayStage.Cue
        x={frame.own.x}
        y={frame.own.y}
        text={cueTextOf(frame.cue)}
        tone={frame.cue.tone}
        side={frame.cueSide}
      />
    );

  return (
    <KkWayStage.World
      label={screen.stageLabel}
      camera={frame.camera}
      artworkSvg={playback.stage.artworkSvg}
    >
      <KkWayStage.Path points={frame.route} aspect={aspect} />
      {ticks}
      {dots}
      {cue}
    </KkWayStage.World>
  );
};
