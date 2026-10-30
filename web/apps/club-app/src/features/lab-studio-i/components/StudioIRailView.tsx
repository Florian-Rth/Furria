import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import { KkStudioIRail } from '@furria/ui/KkStudioIRail';
import type { FC } from 'react';
import type { StudioIRail } from '../hooks/use-studio-i-rail';
import { STUDIO_I_RAIL_LABEL } from '../studio-i-copy';

interface StudioIRailViewProps {
  rail: StudioIRail;
}

export const StudioIRailView: FC<StudioIRailViewProps> = ({ rail }) => {
  const groups = rail.groups.map((group) => {
    const tiles = group.tiles.map((tile) => (
      <KkStudioIRail.Tile
        key={tile.stepId}
        number={tile.number}
        name={tile.name}
        meta={tile.meta}
        current={tile.current}
        label={tile.label}
        onPress={tile.press}
      >
        <KkPracticeSteps.Thumb dots={tile.dots} aspect={rail.aspect} />
      </KkStudioIRail.Tile>
    ));

    return (
      <KkStudioIRail.Group key={group.key} label={group.name}>
        <KkStudioIRail.GroupHead name={group.name} meta={group.meta} />
        <KkStudioIRail.Tiles>{tiles}</KkStudioIRail.Tiles>
      </KkStudioIRail.Group>
    );
  });

  return (
    <KkStudioIRail label={STUDIO_I_RAIL_LABEL}>
      <KkStudioIRail.Lead
        name={rail.lead.name}
        meta={rail.lead.meta}
        current={rail.lead.current}
        onPress={rail.lead.press}
      />
      {groups}
    </KkStudioIRail>
  );
};
