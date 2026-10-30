import { KkPracticeStage } from '@furria/ui/KkPracticeStage';
import { KkStudioIStage } from '@furria/ui/KkStudioIStage';
import type { FC } from 'react';
import type { MixPlayer } from '@/features/act-player/mix-player';
import { PRACTICE_FRONT } from '@/features/act-practice/practice-copy';
import type { StudioIStageView as StageModel } from '../hooks/use-studio-i-stage';
import {
  STUDIO_I_LEGEND_AFTER,
  STUDIO_I_LEGEND_BEFORE,
  STUDIO_I_STAGE_LABEL,
} from '../studio-i-copy';
import { StudioIStageLive } from './StudioIStageLive';

interface StudioIStageViewProps {
  stage: StageModel;
  player: MixPlayer;
  playing: boolean;
}

export const StudioIStageView: FC<StudioIStageViewProps> = ({ stage, player, playing }) => {
  const dots = stage.dots.map((dot) => (
    <KkStudioIStage.Dot
      key={dot.spotId}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      kind={dot.kind}
      selected={dot.selected}
      moved={dot.moved}
      label={dot.label}
      onPress={dot.press}
      onDrag={dot.drag}
    />
  ));

  return (
    <KkPracticeStage
      label={STUDIO_I_STAGE_LABEL}
      frontLabel={PRACTICE_FRONT}
      widthMetres={stage.stage.widthMetres}
      depthMetres={stage.stage.depthMetres}
      artworkSvg={stage.stage.artworkSvg}
    >
      <KkStudioIStage>
        <KkStudioIStage.Catch onPress={stage.clear} />
        <KkStudioIStage.Legend before={STUDIO_I_LEGEND_BEFORE} after={STUDIO_I_LEGEND_AFTER} />
        <KkStudioIStage.Onion ghosts={stage.ghosts} />
        <KkStudioIStage.Paths paths={stage.paths} aspect={stage.aspect} />
        {dots}
        <StudioIStageLive
          player={player}
          tracks={stage.live}
          stage={stage.stage}
          playing={playing}
        />
      </KkStudioIStage>
    </KkPracticeStage>
  );
};
