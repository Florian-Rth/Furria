import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkText } from '@furria/ui/KkText';
import type { FC } from 'react';
import { useBeerHubContext } from '../beer-hub-context';
import { FORM_CONTEXTS, FORM_TITLES, NO_OPEN_TABS, PERSON_LABEL } from '../beer-hub-copy';
import { HUB_LANDING } from '../beer-landing';
import { usePaymentPane } from '../hooks/use-payment-pane';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerPaymentBlock } from './BeerPaymentBlock';

interface BeerPaymentPaneProps {
  initialPersonId: number | null;
}

export const BeerPaymentPane: FC<BeerPaymentPaneProps> = ({ initialPersonId }) => {
  const { now } = useBeerHubContext();
  const pane = usePaymentPane(initialPersonId);
  const block =
    pane.target === null ? null : (
      <BeerPaymentBlock key={pane.targetKey} target={pane.target} now={now} landing={HUB_LANDING} />
    );
  const content = pane.hasOpenTabs ? (
    <KkSelectField
      name="person"
      label={PERSON_LABEL}
      value={pane.pick.value}
      options={pane.options}
      presentation="select"
      onChange={pane.pick.choose}
    />
  ) : (
    <KkText variant="body2" tone="secondary">
      {NO_OPEN_TABS}
    </KkText>
  );

  return (
    <BeerPaneFrame icon="fees" title={FORM_TITLES.payment} context={FORM_CONTEXTS.payment}>
      {content}
      {block}
    </BeerPaneFrame>
  );
};
