import { KkEightsFrame } from '@furria/ui/KkEightsFrame';
import { KkStudioView } from '@furria/ui/KkStudioView';
import { useKkEightsWide } from '@furria/ui/use-kk-eights-wide';
import type { FC } from 'react';
import type { Studio, StudioEvening } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import type { SheetDensity } from '../count-sheet';
import { EIGHTS_FRAME_LABEL } from '../eights-copy';
import { useEightsKeys } from '../hooks/use-eights-keys';
import type { EightsMusicTab } from '../hooks/use-eights-routes';
import { useEightsStudio } from '../hooks/use-eights-studio';
import { EightsDesk } from './EightsDesk';
import { EightsHistorySheet } from './EightsHistorySheet';
import { EightsPhone } from './EightsPhone';
import { EightsSetupScreen } from './EightsSetupScreen';
import { EightsSetupSheet } from './EightsSetupSheet';

interface EightsEditorBodyProps {
  actId: number;
  actName: string;
  studio: Studio;
  viewerId: number | null;
  canEdit: boolean;
  cast: readonly CastPerson[];
  evening: StudioEvening | null;
  zoom: SheetDensity | undefined;
  openMusic: (tab: EightsMusicTab) => void;
}

export const EightsEditorBody: FC<EightsEditorBodyProps> = ({
  actId,
  actName,
  studio,
  viewerId,
  canEdit,
  cast,
  evening,
  zoom,
  openMusic,
}) => {
  const eights = useEightsStudio({ actId, studio, viewerId, canEdit, cast, evening, zoom });
  const wide = useKkEightsWide();
  useEightsKeys(eights);
  const band =
    eights.screen.eveningBand === null ? null : (
      <KkStudioView.Band>
        <KkStudioView.BandNote text={eights.screen.eveningBand} />
      </KkStudioView.Band>
    );
  const started = eights.progress.started;
  const working = wide ? <EightsDesk eights={eights} /> : <EightsPhone eights={eights} />;
  const main = started ? working : <EightsSetupScreen eights={eights} openMusic={openMusic} />;

  return (
    <KkEightsFrame label={EIGHTS_FRAME_LABEL} single={!started}>
      <KkEightsFrame.Heading text={actName} />
      {band}
      {main}
      <EightsHistorySheet actId={actId} studio={eights.screen.studio} />
      <EightsSetupSheet eights={eights} openMusic={openMusic} />
    </KkEightsFrame>
  );
};
