import type { FC } from 'react';
import type { KompassSource } from '../logic/use-kompass-source';
import { KompassError } from './KompassError';
import { KompassLoading } from './KompassLoading';
import { KompassStepper } from './KompassStepper';

interface KompassBodyProps {
  source: KompassSource;
}

export const KompassBody: FC<KompassBodyProps> = ({ source }) => {
  if (source.status === 'loading') {
    return <KompassLoading />;
  }

  if (source.status === 'error') {
    return <KompassError onRetry={source.retry} />;
  }

  return <KompassStepper matcher={source.matcher} />;
};
