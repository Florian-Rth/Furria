import { KkHubRow, KkPanel, KkScreen, KkTitleHeader } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { LabMorph } from '../lab-morphs';
import {
  BACK_TO_LAB,
  COUNCIL_LEAD,
  COUNCIL_TITLE,
  councilPathOf,
  LAB_PATH,
  STAGE_LEAD,
  STAGE_TITLE,
} from '../lab-morphs';
import { LabPeople } from './LabPeople';

interface MorphStagePageProps {
  morph: LabMorph;
}

export const MorphStagePage: FC<MorphStagePageProps> = ({ morph }) => (
  <KkScreen
    kind="list"
    title={STAGE_TITLE}
    header={<KkTitleHeader title={STAGE_TITLE} lead={STAGE_LEAD} />}
    barMorph={morph.name}
  >
    <KkPanel>
      <KkHubRow
        label={COUNCIL_TITLE}
        icon="group"
        meta={COUNCIL_LEAD}
        component={Link}
        to={councilPathOf(morph)}
      />
      <KkHubRow label={BACK_TO_LAB} icon="bolt" meta={morph.title} component={Link} to={LAB_PATH} />
    </KkPanel>
    <LabPeople />
  </KkScreen>
);
