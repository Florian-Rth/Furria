import { KkRule, PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { ExchangeClosingBand } from './internal/ui/ExchangeClosingBand';
import { ExchangeCoreLoop } from './internal/ui/ExchangeCoreLoop';
import { ExchangeHero } from './internal/ui/ExchangeHero';
import { ExchangeIdeas } from './internal/ui/ExchangeIdeas';
import { ExchangeOpenQuestions } from './internal/ui/ExchangeOpenQuestions';
import { ExchangePrinciples } from './internal/ui/ExchangePrinciples';

export const TicketExchangePage: FC = () => (
  <PageLayout>
    <PageLayout.Body>
      <ExchangeHero />
      <KkRule />
      <ExchangeCoreLoop />
      <ExchangePrinciples />
      <ExchangeIdeas />
      <ExchangeOpenQuestions />
    </PageLayout.Body>
    <ExchangeClosingBand />
  </PageLayout>
);
