import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import type { FC } from 'react';
import { SS_FIT, SS_TRANSPORT_VIEW, SS_ZOOM_IN, SS_ZOOM_OUT } from '../setup-copy';
import { SsTransportGroup } from './SsTransportGroup';

interface SsZoomToolsProps {
  centre: CentreScrub;
}

export const SsZoomTools: FC<SsZoomToolsProps> = ({ centre }) => {
  const zoomIn = (): void => {
    centre.zoomBy(1);
  };
  const zoomOut = (): void => {
    centre.zoomBy(-1);
  };
  const outLocked = !centre.canZoomOut;
  const inLocked = !centre.canZoomIn;

  return (
    <SsTransportGroup label={SS_TRANSPORT_VIEW}>
      <KkLaneButton
        text={SS_ZOOM_OUT}
        glyph="zoomOut"
        textShown={false}
        disabled={outLocked}
        onPress={zoomOut}
      />
      <KkLaneButton
        text={SS_ZOOM_IN}
        glyph="zoomIn"
        textShown={false}
        disabled={inLocked}
        onPress={zoomIn}
      />
      <KkLaneButton
        text={SS_FIT}
        glyph="fit"
        textShown={false}
        pressed={centre.fitted}
        onPress={centre.fit}
      />
    </SsTransportGroup>
  );
};
