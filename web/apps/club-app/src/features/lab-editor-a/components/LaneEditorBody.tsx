import { useKkLaneWide } from '@furria/ui/KkLaneWide';
import { KkStudioView } from '@furria/ui/KkStudioView';
import type { FC } from 'react';
import { useState } from 'react';
import type { Studio } from '@/features/acts/schemas';
import { useLaneEditor } from '../hooks/use-lane-editor';
import type { LanePage } from '../hooks/use-lane-page';
import { LaneDeskView } from './LaneDeskView';
import { LanePhoneView } from './LanePhoneView';
import { LaneSetupScreen } from './LaneSetupScreen';

interface LaneEditorBodyProps {
  page: LanePage;
  actId: number;
  studio: Studio;
}

export const LaneEditorBody: FC<LaneEditorBodyProps> = ({ page, actId, studio }) => {
  const lane = useLaneEditor({
    actId,
    studio,
    viewerId: page.viewerId,
    canEdit: page.canEdit,
    cast: page.cast,
    evening: page.evening,
  });
  const wide = useKkLaneWide();
  const [welcomed, setWelcomed] = useState(lane.setup.started);
  const leave = (): void => {
    setWelcomed(true);
    lane.closeSetup();
  };
  const band =
    lane.screen.eveningBand === null ? null : (
      <KkStudioView.BandNote text={lane.screen.eveningBand} />
    );

  if (!welcomed) {
    return <LaneSetupScreen lane={lane} band={band} onLeave={leave} />;
  }

  return wide ? (
    <LaneDeskView lane={lane} band={band} />
  ) : (
    <LanePhoneView lane={lane} band={band} />
  );
};
