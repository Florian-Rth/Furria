import { KkWayRibbon } from '@furria/ui/KkWayRibbon';
import type { FC } from 'react';
import { isLooped } from '@/features/act-practice/practice-controls';
import { partLoopLabelOf } from '@/features/act-practice/practice-copy';
import type { WayScreen } from '../hooks/use-way-screen';
import { WAY_RIBBON_EMPTY, WAY_RIBBON_LABEL, wayTileLabelOf } from '../way-copy';
import { WayEightsLive } from './WayEightsLive';

const AHEAD = 0;
const PASSED = 1;
const NOT_STARTED = -1;

interface WayRibbonProps {
  screen: WayScreen;
}

export const WayRibbon: FC<WayRibbonProps> = ({ screen }) => {
  const { practice, playback } = screen;
  const currentId = practice.step?.stepId ?? null;
  const currentStart = practice.step?.startSeconds ?? NOT_STARTED;
  const groups = screen.ribbon.map((group) => {
    const groupCurrent = group.tiles.some((tile) => tile.stepId === currentId);
    const partName = group.partName;
    const loopPart = (): void => {
      practice.loopPart(group.firstStepId);
    };
    const part =
      partName === null ? null : (
        <KkWayRibbon.Part
          name={partName}
          label={partLoopLabelOf(partName)}
          current={groupCurrent}
          looped={groupCurrent && practice.loopKind === 'part'}
          onPress={loopPart}
        />
      );
    const tiles = group.tiles.map((tile) => {
      const current = tile.stepId === currentId;
      const jump = (): void => {
        practice.jumpTo(tile.stepId);
      };
      const idleFill = (tile.step.endSeconds ?? 0) <= currentStart ? PASSED : AHEAD;
      const eights = current ? (
        <WayEightsLive player={playback.player} step={tile.step} eights={tile.eights} />
      ) : (
        <KkWayRibbon.Eights eights={tile.eights} fill={idleFill} current={false} />
      );

      return (
        <KkWayRibbon.Tile
          key={tile.stepId}
          number={tile.number}
          name={tile.name}
          eights={tile.eights}
          label={wayTileLabelOf(tile.name, tile.eights)}
          current={current}
          looped={isLooped(tile.step, practice.loop)}
          onPress={jump}
        >
          {eights}
        </KkWayRibbon.Tile>
      );
    });

    return (
      <KkWayRibbon.Group key={group.key}>
        {part}
        {tiles}
      </KkWayRibbon.Group>
    );
  });
  const empty = groups.length === 0 ? <KkWayRibbon.Empty text={WAY_RIBBON_EMPTY} /> : null;

  return (
    <KkWayRibbon label={WAY_RIBBON_LABEL}>
      {groups}
      {empty}
    </KkWayRibbon>
  );
};
