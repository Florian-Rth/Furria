import { scrollKeyframesOf } from '../../../internal/scroll-linked';
import { kkTokens } from '../../../tokens';
import { DOCK_HEADER_TURNS, DOCK_TRAVEL, dockProgressAt, dockStageAt } from './dock-flight';

const { headerDrift } = kkTokens.shell;

export const DOCK_HEADER_LEAVING = scrollKeyframesOf(
  DOCK_TRAVEL,
  DOCK_HEADER_TURNS,
  (scrollOffset) => {
    const stage = dockStageAt(dockProgressAt(scrollOffset, DOCK_TRAVEL), true, headerDrift);

    return { opacity: stage.headerOpacity, transform: `translateY(${stage.headerDrift}px)` };
  },
);
