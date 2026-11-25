import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import {
  BEER_LIST_HELP_COPY,
  BEER_LIST_HELP_MANAGE_CHIP,
  BEER_LIST_HELP_SPOTS,
} from '../beer-list-help-copy';
import type { BeerListHelpViewer } from '../hooks/use-beer-list-help-viewer';
import { BeerListHelpBookingPreview } from './BeerListHelpBookingPreview';
import { BeerListHelpPayPreview } from './BeerListHelpPayPreview';
import { BeerListHelpTabPreview } from './BeerListHelpTabPreview';

interface BeerListHelpProps {
  viewer: BeerListHelpViewer;
}

const COPY = BEER_LIST_HELP_COPY;

export const BeerListHelp: FC<BeerListHelpProps> = ({ viewer }) => {
  const gateCopy = viewer.gate === 'noPot' ? COPY.noPot : COPY.join;
  const payEarlier = viewer.hasEarlierPayee ? <KkHelp.Text>{COPY.pay.earlier}</KkHelp.Text> : null;

  const booking =
    viewer.gate === 'open' ? (
      <KkHelp.Hint>
        <KkHelp.Preview>
          <BeerListHelpBookingPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{COPY.booking.title}</KkHelp.Title>
        <KkHelp.Text>{COPY.booking.text}</KkHelp.Text>
        <KkHelp.Text>{COPY.booking.undo}</KkHelp.Text>
        <KkHelp.Text>{COPY.booking.code}</KkHelp.Text>
        <ScreenHelpShow spot={BEER_LIST_HELP_SPOTS.booking} />
      </KkHelp.Hint>
    ) : (
      <KkHelp.Hint>
        <KkHelp.Title>{gateCopy.title}</KkHelp.Title>
        <KkHelp.Text>{gateCopy.text}</KkHelp.Text>
      </KkHelp.Hint>
    );

  const history = viewer.hasHistory ? (
    <KkHelp.Hint>
      <KkHelp.Title>{COPY.history.title}</KkHelp.Title>
      <KkHelp.Text>{COPY.history.text}</KkHelp.Text>
      <KkHelp.Text>{COPY.history.enteredBy}</KkHelp.Text>
      <ScreenHelpShow spot={BEER_LIST_HELP_SPOTS.history} />
    </KkHelp.Hint>
  ) : null;

  const givers = viewer.seesGivers ? (
    <KkHelp.Hint>
      <KkHelp.Title>{COPY.givers.title}</KkHelp.Title>
      <KkHelp.Text>{COPY.givers.text}</KkHelp.Text>
      <ScreenHelpShow spot={BEER_LIST_HELP_SPOTS.givers} />
    </KkHelp.Hint>
  ) : null;

  const manage = viewer.manages ? (
    <KkHelp.Hint>
      <KkHelp.Title chip={BEER_LIST_HELP_MANAGE_CHIP}>{COPY.manage.title}</KkHelp.Title>
      <KkHelp.Text>{COPY.manage.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <BeerListHelpTabPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{COPY.tab.title}</KkHelp.Title>
        <KkHelp.Text>{COPY.tab.text}</KkHelp.Text>
        <ScreenHelpShow spot={BEER_LIST_HELP_SPOTS.tab} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <BeerListHelpPayPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{COPY.pay.title}</KkHelp.Title>
        <KkHelp.Text>{COPY.pay.text}</KkHelp.Text>
        <KkHelp.Text>{COPY.pay.after}</KkHelp.Text>
        {payEarlier}
      </KkHelp.Hint>
      {booking}
      {history}
      {givers}
      {manage}
    </ScreenHelp>
  );
};
