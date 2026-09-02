import { KkCard } from '@furria/ui';
import type { FC } from 'react';
import type { ExchangeIdeaItem } from '@/features/events/exchange-content';

interface ExchangePrincipleCardProps {
  principle: ExchangeIdeaItem;
}

export const ExchangePrincipleCard: FC<ExchangePrincipleCardProps> = ({ principle }) => (
  <KkCard>
    <KkCard.Body>
      <KkCard.Title>{principle.title}</KkCard.Title>
      <KkCard.Text>{principle.description}</KkCard.Text>
    </KkCard.Body>
  </KkCard>
);
