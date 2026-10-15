import type { FC } from 'react';
import type { KkMetalGradient } from '../honour-laps';
import { metalGradientIdOf } from '../svg-id';
import { KkHonourMetalGradient } from './KkHonourMetalGradient';

const GRADIENTS: readonly KkMetalGradient[] = ['bronze', 'silver', 'gold', 'brilliant'];

interface KkHonourMetalDefsProps {
  prefix: string;
}

export const KkHonourMetalDefs: FC<KkHonourMetalDefsProps> = ({ prefix }) => {
  const gradients = GRADIENTS.map((gradient) => {
    const id = metalGradientIdOf(prefix, gradient);

    return <KkHonourMetalGradient key={gradient} id={id} gradient={gradient} />;
  });

  return <defs>{gradients}</defs>;
};
