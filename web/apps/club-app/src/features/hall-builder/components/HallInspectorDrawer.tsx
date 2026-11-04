import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import type { FC } from 'react';
import { useHallBuilderContext } from '../hall-builder-context';
import {
  INSPECT_HALL_LABEL,
  INSPECT_SELECTION_LABEL,
  INSPECTOR_CLOSE_LABEL,
} from '../hall-builder-copy';
import { HallInspectorBody } from './HallInspectorBody';

export const HallInspectorDrawer: FC = () => {
  const builder = useHallBuilderContext();
  const open = builder.isPhone && builder.isInspectorOpen;
  const label = builder.selection.length > 0 ? INSPECT_SELECTION_LABEL : INSPECT_HALL_LABEL;

  return (
    <KkBottomDrawer
      open={open}
      label={label}
      closeLabel={INSPECTOR_CLOSE_LABEL}
      onClose={builder.closeInspector}
    >
      <HallInspectorBody />
    </KkBottomDrawer>
  );
};
