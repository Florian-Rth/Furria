import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkText } from '@furria/ui/KkText';
import type { FC } from 'react';
import { openCratesOf } from '../beer-hub';
import { openHubOf, useBeerHubContext } from '../beer-hub-context';
import {
  FORM_CONTEXTS,
  FORM_TITLES,
  NO_OPEN_TABS,
  PERSON_LABEL,
  personOptionLabelOf,
} from '../beer-hub-copy';
import { usePersonPick } from '../hooks/use-person-pick';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerPaymentBlock } from './BeerPaymentBlock';

interface BeerPaymentPaneProps {
  initialPersonId: number | null;
}

export const BeerPaymentPane: FC<BeerPaymentPaneProps> = ({ initialPersonId }) => {
  const hub = useBeerHubContext();
  const open = openHubOf(hub);
  const openRows = open === null ? [] : open.roster.filter((row) => row.openCrates > 0);
  const pick = usePersonPick(
    initialPersonId ?? openRows[0]?.person.personId ?? null,
    openRows.map((row) => row.person.personId),
  );
  const options = openRows.map((row) => ({
    value: String(row.person.personId),
    label: personOptionLabelOf(row),
  }));
  const picked = openRows.find((row) => row.person.personId === pick.personId) ?? null;
  const target =
    picked === null || open === null
      ? null
      : {
          beerPotId: open.pot.beerPotId,
          person: picked.person,
          oldestFirst: openCratesOf(open.crates, picked.person.personId),
        };
  const block =
    target === null ? null : (
      <BeerPaymentBlock
        key={`${target.person.personId}-${target.oldestFirst.length}`}
        target={target}
        now={hub.now}
        onDone={hub.closePane}
      />
    );
  const content =
    openRows.length === 0 ? (
      <KkText variant="body2" tone="secondary">
        {NO_OPEN_TABS}
      </KkText>
    ) : (
      <KkSelectField
        name="person"
        label={PERSON_LABEL}
        value={pick.value}
        options={options}
        presentation="select"
        onChange={pick.choose}
      />
    );

  return (
    <BeerPaneFrame icon="fees" title={FORM_TITLES.payment} context={FORM_CONTEXTS.payment}>
      {content}
      {block}
    </BeerPaneFrame>
  );
};
