import { KkMeta } from '@furria/ui/KkMeta';
import type { FC } from 'react';

interface BeerFieldErrorProps {
  message: string | undefined;
}

export const BeerFieldError: FC<BeerFieldErrorProps> = ({ message }) => {
  if (message === undefined) {
    return null;
  }

  return <KkMeta tone="accent">{message}</KkMeta>;
};
