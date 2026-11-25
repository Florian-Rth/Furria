import { KkHelp } from '@furria/ui/KkHelp';
import type { FC, ReactNode } from 'react';
import { Fragment } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { BEER_HUB_HELP_COPY, BEER_HUB_HELP_SPOTS } from '../beer-hub-help-copy';
import type { BeerHubHelpTopic } from '../beer-hub-help-topics';
import type { BeerHubHelpViewer } from '../hooks/use-beer-hub-help-viewer';
import { BeerHubHelpHeadPreview } from './BeerHubHelpHeadPreview';
import { BeerHubHelpJournalPreview } from './BeerHubHelpJournalPreview';
import { BeerHubHelpQuickPreview } from './BeerHubHelpQuickPreview';
import { BeerHubHelpRosterPreview } from './BeerHubHelpRosterPreview';

interface BeerHubHelpProps {
  viewer: BeerHubHelpViewer;
}

const COPY = BEER_HUB_HELP_COPY;
const SPOTS = BEER_HUB_HELP_SPOTS;

export const BeerHubHelp: FC<BeerHubHelpProps> = ({ viewer }) => {
  const rosterShow = viewer.showsRoster ? <ScreenHelpShow spot={SPOTS.roster} /> : null;

  const hints: Record<BeerHubHelpTopic, ReactNode> = {
    head: (
      <KkHelp.Hint>
        <KkHelp.Preview>
          <BeerHubHelpHeadPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{COPY.head.title}</KkHelp.Title>
        <KkHelp.Text>{COPY.head.text}</KkHelp.Text>
        <KkHelp.Text>{COPY.head.counters}</KkHelp.Text>
        <ScreenHelpShow spot={SPOTS.head} />
      </KkHelp.Hint>
    ),
    payment: (
      <KkHelp.Hint>
        <KkHelp.Preview>
          <BeerHubHelpQuickPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{COPY.payment.title}</KkHelp.Title>
        <KkHelp.Text>{COPY.payment.text}</KkHelp.Text>
        <KkHelp.Text>{COPY.payment.more}</KkHelp.Text>
        <ScreenHelpShow spot={SPOTS.quick} />
      </KkHelp.Hint>
    ),
    crates: (
      <KkHelp.Hint>
        <KkHelp.Title>{COPY.crates.title}</KkHelp.Title>
        <KkHelp.Text>{COPY.crates.text}</KkHelp.Text>
        <KkHelp.Text>{COPY.crates.note}</KkHelp.Text>
      </KkHelp.Hint>
    ),
    stock: (
      <KkHelp.Hint>
        <KkHelp.Title>{COPY.stock.title}</KkHelp.Title>
        <KkHelp.Text>{COPY.stock.text}</KkHelp.Text>
        <KkHelp.Text>{COPY.stock.after}</KkHelp.Text>
      </KkHelp.Hint>
    ),
    roster: (
      <KkHelp.Hint>
        <KkHelp.Preview>
          <BeerHubHelpRosterPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{COPY.roster.title}</KkHelp.Title>
        <KkHelp.Text>{COPY.roster.text}</KkHelp.Text>
        {rosterShow}
      </KkHelp.Hint>
    ),
    person: (
      <KkHelp.Hint>
        <KkHelp.Title>{COPY.person.title}</KkHelp.Title>
        <KkHelp.Text>{COPY.person.text}</KkHelp.Text>
        <KkHelp.Text>{COPY.person.undo}</KkHelp.Text>
        <KkHelp.Text>{COPY.person.end}</KkHelp.Text>
      </KkHelp.Hint>
    ),
    journal: (
      <KkHelp.Hint>
        <KkHelp.Preview>
          <BeerHubHelpJournalPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{COPY.journal.title}</KkHelp.Title>
        <KkHelp.Text>{COPY.journal.text}</KkHelp.Text>
        <KkHelp.Text>{COPY.journal.filter}</KkHelp.Text>
        <ScreenHelpShow spot={SPOTS.journal} />
      </KkHelp.Hint>
    ),
    setup: (
      <KkHelp.Hint>
        <KkHelp.Title>{COPY.setup.title}</KkHelp.Title>
        <KkHelp.Text>{COPY.setup.text}</KkHelp.Text>
        <KkHelp.Text>{COPY.setup.payPal}</KkHelp.Text>
        <KkHelp.Text>{COPY.setup.enrollments}</KkHelp.Text>
        <KkHelp.Text>{COPY.setup.code}</KkHelp.Text>
      </KkHelp.Hint>
    ),
    drinks: (
      <KkHelp.Hint>
        <KkHelp.Title>{COPY.drinks.title}</KkHelp.Title>
        <KkHelp.Text>{COPY.drinks.text}</KkHelp.Text>
        <KkHelp.Text>{COPY.drinks.price}</KkHelp.Text>
        <KkHelp.Text>{COPY.drinks.default}</KkHelp.Text>
      </KkHelp.Hint>
    ),
    handover: (
      <KkHelp.Hint>
        <KkHelp.Title>{COPY.handover.title}</KkHelp.Title>
        <KkHelp.Text>{COPY.handover.text}</KkHelp.Text>
        <KkHelp.Text>{COPY.handover.after}</KkHelp.Text>
      </KkHelp.Hint>
    ),
    pots: (
      <KkHelp.Hint>
        <KkHelp.Title>{COPY.pots.title}</KkHelp.Title>
        <KkHelp.Text>{COPY.pots.text}</KkHelp.Text>
      </KkHelp.Hint>
    ),
    openPot: (
      <KkHelp.Hint>
        <KkHelp.Title>{COPY.openPot.title}</KkHelp.Title>
        <KkHelp.Text>{COPY.openPot.text}</KkHelp.Text>
        <KkHelp.Text>{COPY.openPot.after}</KkHelp.Text>
        <ScreenHelpShow spot={SPOTS.openPot} />
      </KkHelp.Hint>
    ),
  };
  const shown = viewer.topics.map((topic) => <Fragment key={topic}>{hints[topic]}</Fragment>);

  return <ScreenHelp>{shown}</ScreenHelp>;
};
