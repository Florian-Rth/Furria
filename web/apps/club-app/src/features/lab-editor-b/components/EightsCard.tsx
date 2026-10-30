import { KkEightsChip } from '@furria/ui/KkEightsChip';
import { KkEightsReel } from '@furria/ui/KkEightsReel';
import { KkEightsStrip } from '@furria/ui/KkEightsStrip';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { EIGHTS_STAGE_TOOLS, EIGHTS_UNDO } from '../eights-copy';
import type { EightsCard as EightsCardView } from '../hooks/use-eights-reel';
import type { EightsStageTools } from '../hooks/use-eights-stage-tools';
import type { EightsStudio } from '../hooks/use-eights-studio';
import { EightsCardCounts } from './EightsCardCounts';
import { EightsCardCountsLive } from './EightsCardCountsLive';
import { EightsChips } from './EightsChips';
import { EightsStagePanel } from './EightsStagePanel';
import { EightsStillStage } from './EightsStillStage';

interface EightsCardProps {
  card: EightsCardView;
  eights: EightsStudio;
  tools: EightsStageTools;
  onSeek: (seconds: number) => void;
}

const NO_COUNT = -1;

export const EightsCard: FC<EightsCardProps> = ({ card, eights, tools, onSeek }) => {
  const { screen, editor, history } = eights;
  const stage = card.current ? (
    <EightsStagePanel eights={eights} counts={false} />
  ) : (
    <EightsStillStage scene={editor.scene} seconds={card.start} />
  );
  const chips = card.current ? [...tools.modes, ...tools.chips] : tools.inert;
  const counts = card.current ? (
    <EightsCardCountsLive playback={screen.playback} counts={card.counts} onSeek={onSeek} />
  ) : (
    <EightsCardCounts counts={card.counts} lit={NO_COUNT} onSeek={onSeek} />
  );

  return (
    <KkEightsReel.Card label={card.label} current={card.current}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1, minWidth: 0 }}>
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <KkEightsStrip.Title
            eyebrow={card.eyebrow}
            number={card.number}
            title={card.name}
            meta={card.meta}
          />
        </Stack>
        <KkEightsChip
          glyph="undo"
          text={EIGHTS_UNDO}
          pressed={null}
          disabled={!history.canUndo || !card.current}
          onPress={history.undo}
        />
      </Stack>
      <KkEightsReel.Stage>{stage}</KkEightsReel.Stage>
      <EightsChips label={EIGHTS_STAGE_TOOLS} chips={chips} wrap />
      {counts}
    </KkEightsReel.Card>
  );
};
