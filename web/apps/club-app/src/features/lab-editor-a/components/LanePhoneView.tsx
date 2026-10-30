import { KkLaneBar } from '@furria/ui/KkLaneBar';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneCards } from '@furria/ui/KkLaneCards';
import { KkLaneDesk } from '@furria/ui/KkLaneDesk';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import { KkLanePhone } from '@furria/ui/KkLanePhone';
import { KkLaneProgress } from '@furria/ui/KkLaneProgress';
import type { FC, ReactNode } from 'react';
import { useVisitHistory } from '@/features/act-studio/hooks/use-visit-history';
import { useLaneCards } from '../hooks/use-lane-cards';
import type { LaneEditor } from '../hooks/use-lane-editor';
import { useLaneKeys } from '../hooks/use-lane-keys';
import { useLaneMark } from '../hooks/use-lane-mark';
import { useLaneRoutes } from '../hooks/use-lane-routes';
import {
  LANE_BACK,
  LANE_CARDS,
  LANE_CHECKLIST,
  LANE_DESK_LABEL,
  LANE_EMPTY_CARD,
  LANE_FORWARD,
  LANE_HISTORY_GROUP,
  LANE_MUSIC_PAGE,
  LANE_PAUSE,
  LANE_PHONE_HEAD,
  LANE_PLAY,
  LANE_REDO,
  LANE_TRANSPORT,
  LANE_UNDO,
  progressLabelOf,
  progressTextOf,
} from '../lane-copy';
import { LaneCardView } from './LaneCardView';
import { LaneReadoutLive } from './LaneReadoutLive';
import { LaneSetupList } from './LaneSetupList';

interface LanePhoneViewProps {
  lane: LaneEditor;
  band: ReactNode;
}

export const LanePhoneView: FC<LanePhoneViewProps> = ({ lane, band }) => {
  const { screen, setup } = lane;
  const { practice, playback } = screen;
  const history = useVisitHistory(screen.actId, screen.studio);
  const routes = useLaneRoutes(screen.actId, screen.evening);
  const cards = useLaneCards(lane);
  const mark = useLaneMark(lane);
  useLaneKeys(screen, null);
  const back = (): void => {
    practice.skip('back');
  };
  const forward = (): void => {
    practice.skip('forward');
  };
  const music = (): void => {
    routes.openMusic('music');
  };
  const views = cards.cards.map((card) => (
    <LaneCardView
      key={card.key}
      lane={lane}
      card={card}
      texts={cards.texts}
      history={history}
      mark={mark}
    />
  ));
  const empty = (
    <KkLaneDesk.Panel label={LANE_EMPTY_CARD} kind="region">
      <KkLaneInspector>
        <KkLaneInspector.Note text={LANE_EMPTY_CARD} />
      </KkLaneInspector>
    </KkLaneDesk.Panel>
  );
  const carousel =
    views.length === 0 ? (
      empty
    ) : (
      <KkLaneCards label={LANE_CARDS} index={cards.index} onIndex={cards.choose}>
        {views}
      </KkLaneCards>
    );
  const sheet = (
    <KkLaneDesk.Panel label={LANE_CHECKLIST} kind="complementary">
      <KkLaneInspector>
        <LaneSetupList lane={lane} onLeave={lane.closeSetup} />
      </KkLaneInspector>
    </KkLaneDesk.Panel>
  );
  const body = lane.setupShown ? sheet : carousel;
  const playText = practice.playing ? LANE_PAUSE : LANE_PLAY;
  const playGlyph = practice.playing ? 'pause' : 'play';
  const stepLocked = !practice.canStep;
  const playLocked = !practice.canPlay;
  const undoLocked = !history.canUndo;
  const redoLocked = !history.canRedo;
  const progressText = progressTextOf(setup.done, setup.total);
  const progressLabel = progressLabelOf(setup.done, setup.total);

  return (
    <KkLanePhone label={LANE_DESK_LABEL}>
      <KkLanePhone.Area area="band">{band}</KkLanePhone.Area>
      <KkLanePhone.Area area="head">
        <KkLaneBar label={LANE_PHONE_HEAD}>
          <KkLaneBar.Group label={LANE_HISTORY_GROUP} grow>
            <KkLaneButton
              text={LANE_UNDO}
              glyph="undo"
              textShown={false}
              disabled={undoLocked}
              onPress={history.undo}
            />
            <KkLaneButton
              text={LANE_REDO}
              glyph="redo"
              textShown={false}
              disabled={redoLocked}
              onPress={history.redo}
            />
          </KkLaneBar.Group>
          <KkLaneButton text={LANE_MUSIC_PAGE} glyph="music" onPress={music} />
          <KkLaneProgress
            done={setup.done}
            total={setup.total}
            text={progressText}
            label={progressLabel}
            expanded={lane.setupShown}
            onPress={lane.toggleSetup}
          />
        </KkLaneBar>
      </KkLanePhone.Area>
      <KkLanePhone.Area area="cards">{body}</KkLanePhone.Area>
      <KkLanePhone.Area area="transport">
        <KkLaneBar label={LANE_TRANSPORT}>
          <KkLaneBar.Group label={LANE_TRANSPORT} grow>
            <KkLaneButton
              text={LANE_BACK}
              glyph="back"
              textShown={false}
              disabled={stepLocked}
              onPress={back}
            />
            <KkLaneButton
              text={playText}
              glyph={playGlyph}
              tone="accent"
              textShown={false}
              disabled={playLocked}
              onPress={practice.toggle}
            />
            <KkLaneButton
              text={LANE_FORWARD}
              glyph="forward"
              textShown={false}
              disabled={stepLocked}
              onPress={forward}
            />
            <LaneReadoutLive player={playback.player} marks={playback.countMarks} />
          </KkLaneBar.Group>
          <KkLaneButton
            text={practice.rateText}
            label={practice.rateLabel}
            pressed={practice.slowed}
            onPress={practice.slowDown}
          />
        </KkLaneBar>
      </KkLanePhone.Area>
    </KkLanePhone>
  );
};
