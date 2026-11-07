import { EJ_FIT, EJ_ZOOM, EJ_ZOOM_IN, EJ_ZOOM_OUT } from '@furria/studio/edit-jobs-copy';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { KkEjButton } from '@furria/ui/KkEjButton';
import { KkLaneBar } from '@furria/ui/KkLaneBar';
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
    <KkLaneBar.Group label={EJ_ZOOM}>
      <KkEjButton
        text={EJ_ZOOM_OUT}
        glyph="zoomOut"
        textShown={false}
        disabled={outLocked}
        onPress={zoomOut}
      />
      <KkEjButton
        text={EJ_ZOOM_IN}
        glyph="zoomIn"
        textShown={false}
        disabled={inLocked}
        onPress={zoomIn}
      />
      <KkEjButton
        text={EJ_FIT}
        glyph="fit"
        textShown={false}
        pressed={centre.fitted}
        onPress={centre.fit}
      />
    </KkLaneBar.Group>
  );
};
