import type { FC } from 'react';
import { LinkPageFrame } from '@/features/link-page/components/LinkPageFrame';
import { useRedeemScreen } from '../hooks/use-redeem-screen';
import { RedeemBody } from './RedeemBody';

export const RedeemScreen: FC = () => {
  const control = useRedeemScreen();

  return (
    <LinkPageFrame>
      <RedeemBody control={control} />
    </LinkPageFrame>
  );
};
