import { KkSeal } from '@furria/ui';
import type { FC } from 'react';
import { applyThanksSealCaption, applyThanksSealLabel } from '@/features/membership/apply-content';

export const ApplyThanksSeal: FC = () => (
  <KkSeal
    dateLabel={applyThanksSealLabel}
    caption={applyThanksSealCaption}
    size={132}
    rotation={7}
  />
);
