import { JOB_FIT, JOB_ZOOM, JOB_ZOOM_IN, JOB_ZOOM_OUT } from '@furria/studio/job-copy';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { KkLaneBar } from '@furria/ui/KkLaneBar';
import { KkPillButton } from '@furria/ui/KkPillButton';
import type { FC } from 'react';

interface JobZoomToolsProps {
  centre: CentreScrub;
}

export const JobZoomTools: FC<JobZoomToolsProps> = ({ centre }) => {
  const zoomIn = (): void => {
    centre.zoomBy(1);
  };
  const zoomOut = (): void => {
    centre.zoomBy(-1);
  };
  const outLocked = !centre.canZoomOut;
  const inLocked = !centre.canZoomIn;

  return (
    <KkLaneBar.Group label={JOB_ZOOM}>
      <KkPillButton
        text={JOB_ZOOM_OUT}
        glyph="zoomOut"
        textShown={false}
        disabled={outLocked}
        onPress={zoomOut}
      />
      <KkPillButton
        text={JOB_ZOOM_IN}
        glyph="zoomIn"
        textShown={false}
        disabled={inLocked}
        onPress={zoomIn}
      />
      <KkPillButton
        text={JOB_FIT}
        glyph="fit"
        textShown={false}
        pressed={centre.fitted}
        onPress={centre.fit}
      />
    </KkLaneBar.Group>
  );
};
