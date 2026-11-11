import type { FC } from 'react';
import { SignedOutFrame } from '@/features/login/components/SignedOutFrame';
import { ClaimWindowView } from './ClaimWindowView';

export const ClaimWindowScreen: FC = () => (
  <SignedOutFrame>
    <ClaimWindowView />
  </SignedOutFrame>
);
