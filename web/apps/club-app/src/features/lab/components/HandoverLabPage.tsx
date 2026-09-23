import type { KkHandoverStage } from '@furria/ui';
import { KkPersonRow, KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { LAB_PATH, LAB_TITLE } from '../lab-entries';
import { LAB_PEOPLE } from '../lab-people';

const DEMO_TITLE = 'Mitglieder';
const LAB_ORIGIN = { label: LAB_TITLE, to: LAB_PATH };
const DEMO_LEAD = 'Kontakte, Gruppen und Rollen aller Personen im Verein.';

interface HandoverLabPageProps {
  stage: KkHandoverStage;
}

export const HandoverLabPage: FC<HandoverLabPageProps> = ({ stage }) => {
  const rows = LAB_PEOPLE.map((person) => (
    <KkPersonRow
      key={person.name}
      initials={person.initials}
      name={person.name}
      meta={person.meta}
    />
  ));

  return (
    <KkScreen
      kind="list"
      title={DEMO_TITLE}
      origin={LAB_ORIGIN}
      header={<KkTitleHeader title={DEMO_TITLE} lead={DEMO_LEAD} />}
      handover={stage}
    >
      {rows}
    </KkScreen>
  );
};
