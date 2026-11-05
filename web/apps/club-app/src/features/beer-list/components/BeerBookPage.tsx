import type { FC } from 'react';
import { useSessionSnapshot } from '@/features/session/hooks/use-session-snapshot';
import { BeerBookFrame } from './BeerBookFrame';
import { BeerBookSignIn } from './BeerBookSignIn';
import { BeerBookTab } from './BeerBookTab';

export const BeerBookPage: FC = () => {
  const { status } = useSessionSnapshot();
  const content = status === 'anonymous' ? <BeerBookSignIn /> : <BeerBookTab />;

  return <BeerBookFrame>{content}</BeerBookFrame>;
};
