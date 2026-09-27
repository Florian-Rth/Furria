import type { FC } from 'react';
import { useRedeemScreen } from '../hooks/use-redeem-screen';
import { RedeemBody } from './RedeemBody';
import { RedeemFrame } from './RedeemFrame';

export const RedeemScreen: FC = () => {
  const control = useRedeemScreen();

  return (
    <RedeemFrame>
      <RedeemBody control={control} />
    </RedeemFrame>
  );
};
