import type { FC } from 'react';
import { OverviewCard } from './OverviewCard';
import { OverviewField } from './OverviewField';
import { OverviewFields } from './OverviewFields';

interface OverviewAccessCardProps {
  email: string;
}

export const OverviewAccessCard: FC<OverviewAccessCardProps> = ({ email }) => (
  <OverviewCard title="Zugang">
    <OverviewFields>
      <OverviewField label="E-Mail-Adresse" value={email} />
    </OverviewFields>
  </OverviewCard>
);
