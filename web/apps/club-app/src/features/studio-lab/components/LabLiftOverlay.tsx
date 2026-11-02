import { KkTouchLab } from '@furria/ui/KkTouchLab';
import type { FC, ReactNode } from 'react';
import type { LabArea, LabLiftView } from '../hooks/use-timeline-playground';
import { LOUPE } from '../hooks/use-timeline-playground';

interface LabLiftOverlayProps {
  lifted: LabLiftView | null;
  area: LabArea;
  magnified: ReactNode;
}

export const LabLiftOverlay: FC<LabLiftOverlayProps> = ({ lifted, area, magnified }) => {
  if (lifted === null) {
    return null;
  }
  const loupe = lifted.lift.loupe;
  const lens =
    loupe === null ? null : (
      <KkTouchLab.Loupe
        x={loupe.x}
        y={loupe.y}
        diameter={LOUPE.diameter}
        contentX={loupe.contentX}
        contentY={loupe.contentY}
        zoom={LOUPE.zoom}
        areaWidth={area.width}
        areaHeight={area.height}
      >
        {magnified}
      </KkTouchLab.Loupe>
    );

  return (
    <>
      {lens}
      <KkTouchLab.Readout
        x={lifted.lift.readout.x}
        y={lifted.lift.readout.y}
        value={lifted.readout.value}
        detail={lifted.readout.detail}
        badge={lifted.readout.badge}
      />
    </>
  );
};
