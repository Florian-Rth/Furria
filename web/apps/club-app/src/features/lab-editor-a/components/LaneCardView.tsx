import { KkLaneBar } from '@furria/ui/KkLaneBar';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneCards } from '@furria/ui/KkLaneCards';
import type { FC } from 'react';
import type { StepTexts } from '@/features/act-studio/hooks/use-step-texts';
import type { VisitHistory } from '@/features/act-studio/hooks/use-visit-history';
import type { LaneCard } from '../hooks/use-lane-cards';
import type { LaneEditor } from '../hooks/use-lane-editor';
import type { LaneMark } from '../hooks/use-lane-mark';
import {
  LANE_ACTIONS,
  LANE_MARK_HERE,
  LANE_MARK_HERE_LABEL,
  LANE_NAME,
  LANE_UNDO,
} from '../lane-copy';
import { LaneCardChips } from './LaneCardChips';
import { LaneCardCounts } from './LaneCardCounts';
import { LaneStageStill } from './LaneStageStill';
import { LaneStageView } from './LaneStageView';

interface LaneCardViewProps {
  lane: LaneEditor;
  card: LaneCard;
  texts: StepTexts;
  history: VisitHistory;
  mark: LaneMark;
}

export const LaneCardView: FC<LaneCardViewProps> = ({ lane, card, texts, history, mark }) => {
  const still = card.near ? (
    <LaneStageStill lane={lane} seconds={card.step.startSeconds ?? 0} />
  ) : null;
  const stage = card.current ? <LaneStageView lane={lane} /> : still;
  const chips = card.current ? <LaneCardChips lane={lane} /> : null;
  const undoLocked = !history.canUndo;

  return (
    <KkLaneCards.Card label={card.label} current={card.current}>
      <KkLaneCards.Title
        eyebrow={card.eyebrow}
        lead={card.number}
        name={card.name}
        label={LANE_NAME}
        editable={card.current}
        onChange={texts.rename}
        onCommit={texts.commit}
      />
      <KkLaneCards.Stage>{stage}</KkLaneCards.Stage>
      {chips}
      <LaneCardCounts lane={lane} step={card.step} current={card.current} />
      <KkLaneCards.Foot>
        <KkLaneBar.Group label={LANE_ACTIONS}>
          <KkLaneButton
            text={LANE_MARK_HERE}
            glyph="add"
            label={LANE_MARK_HERE_LABEL}
            disabled={mark.locked}
            onPress={mark.press}
          />
          <KkLaneButton
            text={LANE_UNDO}
            glyph="undo"
            disabled={undoLocked}
            onPress={history.undo}
          />
        </KkLaneBar.Group>
      </KkLaneCards.Foot>
    </KkLaneCards.Card>
  );
};
