import { KkPlanTouch } from '@furria/ui/KkPlanTouch';
import type { FC } from 'react';
import { useHallBuilderContext } from '../hall-builder-context';
import { HALL_BUILDER_DESK_LABEL } from '../hall-builder-copy';
import { HallBuilderCanvas } from './HallBuilderCanvas';
import { HallInspectorSheet } from './HallInspectorSheet';
import { HallTouchActionBar } from './HallTouchActionBar';
import { HallTouchDock } from './HallTouchDock';
import { HallTouchTop } from './HallTouchTop';
import { HallTouchTray } from './HallTouchTray';

export const HallTouchDesk: FC = () => {
  const builder = useHallBuilderContext();
  const showsSheet = builder.hasSideSheet && builder.isInspectorOpen;
  const sheet = showsSheet ? (
    <KkPlanTouch.Sheet>
      <HallInspectorSheet />
    </KkPlanTouch.Sheet>
  ) : null;

  return (
    <KkPlanTouch label={HALL_BUILDER_DESK_LABEL}>
      <KkPlanTouch.Top>
        <HallTouchTop />
      </KkPlanTouch.Top>
      <KkPlanTouch.Canvas>
        <HallBuilderCanvas />
        <HallTouchActionBar />
        <HallTouchTray />
      </KkPlanTouch.Canvas>
      {sheet}
      <KkPlanTouch.Dock>
        <HallTouchDock />
      </KkPlanTouch.Dock>
    </KkPlanTouch>
  );
};
