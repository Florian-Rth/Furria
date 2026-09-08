import { KkCard } from '@furria/ui';
import type { FC, PropsWithChildren } from 'react';

interface OverviewCardProps extends PropsWithChildren {
  title: string;
}

export const OverviewCard: FC<OverviewCardProps> = ({ title, children }) => (
  <KkCard>
    <KkCard.Body>
      <KkCard.Title>{title}</KkCard.Title>
      {children}
    </KkCard.Body>
  </KkCard>
);
