import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC, PropsWithChildren } from 'react';
import { useTimeline } from '../logic/timeline-context';

export const TimelineStrip: FC<PropsWithChildren> = ({ children }) => {
  const { centre } = useTimeline();

  if (centre === null) {
    return children;
  }

  return (
    <KkTimeline.Strip
      x={centre.x}
      scale={centre.scale}
      left={centre.strip.start}
      width={centre.strip.width}
      canvasWidth={centre.contentWidth}
    >
      {children}
    </KkTimeline.Strip>
  );
};
