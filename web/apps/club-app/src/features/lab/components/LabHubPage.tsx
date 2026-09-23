import { KkHubRow, KkPanel, KkPanelSection, KkScreen, KkTitleHeader } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { MANAGE_ORIGIN } from '@/features/session';
import { LAB_LEAD, LAB_MORPHS, LAB_TITLE, MORPH_LAB_BANK, stagePathOf } from '../lab-morphs';

export const LabHubPage: FC = () => {
  const rows = LAB_MORPHS.map((morph) => (
    <KkHubRow
      key={morph.slug}
      label={morph.title}
      icon="bolt"
      meta={morph.summary}
      component={Link}
      to={stagePathOf(morph)}
    />
  ));

  return (
    <KkScreen
      kind="detail"
      title={LAB_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={LAB_TITLE} lead={LAB_LEAD} />}
    >
      <KkPanelSection title={MORPH_LAB_BANK}>
        <KkPanel>{rows}</KkPanel>
      </KkPanelSection>
    </KkScreen>
  );
};
