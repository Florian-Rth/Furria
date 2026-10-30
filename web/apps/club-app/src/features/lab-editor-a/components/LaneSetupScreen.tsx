import { KkLaneBar } from '@furria/ui/KkLaneBar';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneDesk } from '@furria/ui/KkLaneDesk';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import { KkLanePhone } from '@furria/ui/KkLanePhone';
import type { FC, ReactNode } from 'react';
import type { LaneEditor } from '../hooks/use-lane-editor';
import { LANE_CHECKLIST, LANE_TO_EDITOR } from '../lane-copy';
import { LaneSetupList } from './LaneSetupList';

interface LaneSetupScreenProps {
  lane: LaneEditor;
  band: ReactNode;
  onLeave: () => void;
}

export const LaneSetupScreen: FC<LaneSetupScreenProps> = ({ lane, band, onLeave }) => (
  <KkLanePhone label={LANE_CHECKLIST} narrow>
    <KkLanePhone.Area area="band">{band}</KkLanePhone.Area>
    <KkLanePhone.Area area="head">
      <KkLaneBar label={LANE_CHECKLIST}>
        <KkLaneBar.Group label={LANE_CHECKLIST} grow />
        <KkLaneButton text={LANE_TO_EDITOR} glyph="right" onPress={onLeave} />
      </KkLaneBar>
    </KkLanePhone.Area>
    <KkLanePhone.Area area="cards">
      <KkLaneDesk.Panel label={LANE_CHECKLIST} kind="region" fit>
        <KkLaneInspector>
          <LaneSetupList lane={lane} onLeave={onLeave} />
        </KkLaneInspector>
      </KkLaneDesk.Panel>
    </KkLanePhone.Area>
  </KkLanePhone>
);
