import { KkCard } from '@furria/ui';
import type { FC } from 'react';
import type { ExchangeIdeaItem } from '@/features/events/exchange-content';

interface ExchangeIdeaCardProps {
  idea: ExchangeIdeaItem;
}

export const ExchangeIdeaCard: FC<ExchangeIdeaCardProps> = ({ idea }) => (
  <KkCard sx={{ borderStyle: 'dashed', boxShadow: 'none' }}>
    <KkCard.Body>
      <KkCard.Title>{idea.title}</KkCard.Title>
      <KkCard.Text>{idea.description}</KkCard.Text>
    </KkCard.Body>
  </KkCard>
);
