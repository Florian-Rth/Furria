import { KkPlanDesk } from '@furria/ui/KkPlanDesk';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import type { HallDetails } from '@/features/hall-plan/schemas';
import { toScreenHelp } from '@/features/help/screen-help';
import { HallBuilderContext } from '../hall-builder-context';
import { HALL_BUILDER_DESK_LABEL, HALL_FALLBACK_NAME } from '../hall-builder-copy';
import { useHallBuilder } from '../hooks/use-hall-builder';
import { useHallBuilderHelpViewer } from '../hooks/use-hall-builder-help-viewer';
import { HallAddSheet } from './HallAddSheet';
import { HallBuilderCanvas } from './HallBuilderCanvas';
import { HallBuilderHelp } from './HallBuilderHelp';
import { HallBuilderRail } from './HallBuilderRail';
import { HallBuilderStatus } from './HallBuilderStatus';
import { HallInspector } from './HallInspector';
import { HallInspectorDrawer } from './HallInspectorDrawer';
import { HallTouchDesk } from './HallTouchDesk';

interface HallBuilderScreenProps {
  hall: HallDetails;
  origin: KkScreenOrigin;
  onConflict: () => void;
}

export const HallBuilderScreen: FC<HallBuilderScreenProps> = ({ hall, origin, onConflict }) => {
  const builder = useHallBuilder(hall, origin, onConflict);
  const title = builder.name.trim() === '' ? HALL_FALLBACK_NAME : builder.name;
  const helpViewer = useHallBuilderHelpViewer();
  const help = toScreenHelp(<HallBuilderHelp viewer={helpViewer} />);
  const desk = builder.isTouch ? (
    <HallTouchDesk />
  ) : (
    <KkPlanDesk label={HALL_BUILDER_DESK_LABEL}>
      <KkPlanDesk.Status>
        <HallBuilderStatus />
      </KkPlanDesk.Status>
      <KkPlanDesk.Rail>
        <HallBuilderRail />
      </KkPlanDesk.Rail>
      <KkPlanDesk.Canvas>
        <HallBuilderCanvas />
      </KkPlanDesk.Canvas>
      <KkPlanDesk.Inspector>
        <HallInspector />
      </KkPlanDesk.Inspector>
    </KkPlanDesk>
  );

  return (
    <HallBuilderContext.Provider value={builder}>
      <KkScreen kind="fullscreen" title={title} origin={origin} help={help}>
        <KkVisuallyHidden component="h1">{title}</KkVisuallyHidden>
        {desk}
        <HallInspectorDrawer />
        <HallAddSheet />
      </KkScreen>
    </HallBuilderContext.Provider>
  );
};
