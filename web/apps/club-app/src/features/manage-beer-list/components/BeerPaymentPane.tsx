import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkText } from '@furria/ui/KkText';
import type { FC } from 'react';
import { openHubOf, useBeerHubContext } from '../beer-hub-context';
import { FORM_TITLES, NO_OPEN_TABS, PERSON_LABEL, payWaysOf } from '../beer-hub-copy';
import { HUB_LANDING } from '../beer-landing';
import { usePaymentPane } from '../hooks/use-payment-pane';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerPaymentBlock } from './BeerPaymentBlock';

interface BeerPaymentPaneProps {
  initialPersonId: number | null;
}

export const BeerPaymentPane: FC<BeerPaymentPaneProps> = ({ initialPersonId }) => {
  const hub = useBeerHubContext();
  const { now } = hub;
  const pot = openHubOf(hub)?.pot ?? null;
  const context = payWaysOf(pot?.owner ?? null, pot?.paymentLink ?? null);
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
    <BeerPaneFrame icon="fees" title={FORM_TITLES.payment} context={context}>
      {content}
      {block}
    </BeerPaneFrame>
  );
};
