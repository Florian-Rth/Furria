import { KkPlanActionBar } from '@furria/ui/KkPlanActionBar';
import { KkPlanTouch } from '@furria/ui/KkPlanTouch';
import type { FC } from 'react';
import { useHallBuilderContext } from '../hall-builder-context';
import {
  ACTION_BAR_LABEL,
  DELETE_LABEL,
  DUPLICATE_LABEL,
  MERGE_AREAS_LABEL,
  MORE_LABEL,
  ROTATE_LEFT_ACTION_LABEL,
  ROTATE_RIGHT_ACTION_LABEL,
} from '../hall-builder-copy';

export const HallTouchActionBar: FC = () => {
  const builder = useHallBuilderContext();
  const anchor = builder.actionBar;

  if (anchor === null) {
    return null;
  }

  const merge =
    builder.areaMerge === 'hidden' ? null : (
      <KkPlanActionBar.Button
        id="merge"
        label={MERGE_AREAS_LABEL}
        icon="area"
        disabled={builder.areaMerge === 'apart'}
        onClick={builder.mergeSelectedAreas}
      />
    );

  return (
    <KkPlanTouch.Float x={anchor.x} y={anchor.y} placement={anchor.placement}>
      <KkPlanActionBar label={ACTION_BAR_LABEL}>
        {merge}
        <KkPlanActionBar.Button
          id="rotateLeft"
          label={ROTATE_LEFT_ACTION_LABEL}
          icon="rotateLeft"
          narrowHidden
          onClick={builder.rotateLeft}
        />
        <KkPlanActionBar.Button
          id="rotateRight"
          label={ROTATE_RIGHT_ACTION_LABEL}
          icon="rotate"
          narrowHidden
          onClick={builder.rotateRight}
        />
        <KkPlanActionBar.Button
          id="duplicate"
          label={DUPLICATE_LABEL}
          icon="copy"
          onClick={builder.duplicateSelection}
        />
        <KkPlanActionBar.Button
          id="delete"
          label={DELETE_LABEL}
          icon="delete"
          tone="danger"
          onClick={builder.deleteSelection}
        />
        <KkPlanActionBar.Divider />
        <KkPlanActionBar.Button
          id="more"
          label={MORE_LABEL}
          icon="menuVertical"
          onClick={builder.inspectSelection}
        />
      </KkPlanActionBar>
    </KkPlanTouch.Float>
  );
};
