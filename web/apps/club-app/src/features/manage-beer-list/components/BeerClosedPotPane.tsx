import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkPourDay } from '@furria/ui/KkPourDay';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useBeerHubContext } from '../beer-hub-context';
import {
  ALL_PAID,
  cratesLabel,
  ERROR_TITLE,
  euroOf,
  fullNameOf,
  POTS_TITLE,
  potFactsOf,
  potLabelOf,
  RETRY_LABEL,
} from '../beer-hub-copy';
import type { ClosedPotPane } from '../hooks/use-closed-pot-pane';
import { useClosedPotPane } from '../hooks/use-closed-pot-pane';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerPaymentBlock } from './BeerPaymentBlock';

const STAY_IN_PANE = (): undefined => undefined;

interface BeerClosedPotPaneProps {
  beerPotId: number;
}

const headOf = (pane: ClosedPotPane): { title: string; context: string } =>
  pane.kind === 'ready' && pane.pot !== null
    ? {
        title: potLabelOf(pane.pot.owner, pane.pot.openedAt, pane.pot.closedAt),
        context: potFactsOf(pane.pot.openTabs, pane.pot.openCents),
      }
    : { title: POTS_TITLE, context: '' };

export const BeerClosedPotPane: FC<BeerClosedPotPaneProps> = ({ beerPotId }) => {
  const hub = useBeerHubContext();
  const pane = useClosedPotPane(beerPotId);
  const head = headOf(pane);
  const bodyOf = (): ReactNode => {
    if (pane.kind === 'loading') {
      return <KkSkeletonRow count={4} shape="select" />;
    }
    if (pane.kind === 'failed') {
      const message = toWriteErrorMessage(pane.error) ?? '';
      const retry = <KkButton onClick={pane.retry}>{RETRY_LABEL}</KkButton>;

      return <KkErrorState title={ERROR_TITLE} description={message} action={retry} />;
    }
    if (pane.owing.length === 0) {
      return (
        <KkText variant="body2" tone="secondary">
          {ALL_PAID}
        </KkText>
      );
    }

    return pane.owing.map((target) => {
      const name = fullNameOf(target.person);
      const openCents = target.oldestFirst.reduce((sum, crate) => sum + crate.priceCents, 0);
      const facts = `${cratesLabel(target.oldestFirst.length)} · ${euroOf(openCents)}`;

      return (
        <Stack key={target.person.personId} sx={{ gap: 1 }}>
          <KkPourDay label={name} facts={facts} />
          <BeerPaymentBlock
            key={target.oldestFirst.length}
            target={target}
            now={hub.now}
            onDone={STAY_IN_PANE}
          />
        </Stack>
      );
    });
  };
  const body = bodyOf();

  return (
    <BeerPaneFrame icon="archive" title={head.title} context={head.context}>
      {body}
    </BeerPaneFrame>
  );
};
