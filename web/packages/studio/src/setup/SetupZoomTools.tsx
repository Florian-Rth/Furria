import { SetupTransportGroup } from '@furria/studio/SetupTransportGroup';
import {
  SETUP_FIT,
  SETUP_TRANSPORT_VIEW,
  SETUP_ZOOM_IN,
  SETUP_ZOOM_OUT,
} from '@furria/studio/step-setup-copy';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import type { FC } from 'react';

interface SetupZoomToolsProps {
  centre: CentreScrub;
}

export const SetupZoomTools: FC<SetupZoomToolsProps> = ({ centre }) => {
  const zoomIn = (): void => {
    centre.zoomBy(1);
  };
  const zoomOut = (): void => {
    centre.zoomBy(-1);
  };
  const outLocked = !centre.canZoomOut;
  const inLocked = !centre.canZoomIn;

  return (
    <SetupTransportGroup label={SETUP_TRANSPORT_VIEW}>
      <KkLaneButton
        text={SETUP_ZOOM_OUT}
        glyph="zoomOut"
        textShown={false}
        disabled={outLocked}
        onPress={zoomOut}
      />
      <KkLaneButton
        text={SETUP_ZOOM_IN}
        glyph="zoomIn"
        textShown={false}
        disabled={inLocked}
        onPress={zoomIn}
      />
      <KkLaneButton
        text={SETUP_FIT}
        glyph="fit"
        textShown={false}
        pressed={centre.fitted}
        onPress={centre.fit}
      />
    </SetupTransportGroup>
  );
};
