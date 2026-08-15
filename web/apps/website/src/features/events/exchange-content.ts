import type { LinkProps } from '@tanstack/react-router';

export interface ExchangeBandContent {
  kicker: string;
  headline: string;
  note: string;
  ctaLabel: string;
  ctaTo: LinkProps['to'];
}

export const exchangeBandContent: ExchangeBandContent = {
  kicker: 'KARTENBÖRSE',
  headline: 'AUSVERKAUFT IST NICHT DAS ENDE',
  note: 'Für ausverkaufte Abende planen wir eine Kartenbörse — wie sie genau funktioniert, arbeiten wir gerade sorgfältig aus.',
  ctaLabel: 'Zur Kartenbörse →',
  ctaTo: '/events/exchange',
};
