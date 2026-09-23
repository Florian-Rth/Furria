import { KkHubRow, KkPanel, KkScreen, KkTitleHeader } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { LabMorph } from '../lab-morphs';
import {
  COUNCIL_LEAD,
  COUNCIL_TITLE,
  PRESIDENT_TITLE,
  presidentPathOf,
  STAGE_TITLE,
  stagePathOf,
} from '../lab-morphs';
import { LabPeople } from './LabPeople';

interface MorphCouncilPageProps {
  morph: LabMorph;
}

export const MorphCouncilPage: FC<MorphCouncilPageProps> = ({ morph }) => {
  const origin = { label: STAGE_TITLE, to: stagePathOf(morph) };

  return (
    <KkScreen
      kind="list"
      title={COUNCIL_TITLE}
      origin={origin}
      header={<KkTitleHeader title={COUNCIL_TITLE} lead={COUNCIL_LEAD} />}
      barMorph={morph.name}
    >
      <KkPanel>
        <KkHubRow
          label={PRESIDENT_TITLE}
          icon="person"
          component={Link}
          to={presidentPathOf(morph)}
        />
      </KkPanel>
      <LabPeople />
    </KkScreen>
  );
};
