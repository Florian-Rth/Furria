import type { FC } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkHandoverHeaderProps } from '../../handover-stage';
import { KkShellHeader } from '../../internal/layout/KkShellHeader';
import { FanfareLiftHeader } from './FanfareLiftHeader';

export const FanfareHeader: FC<KkHandoverHeaderProps> = ({ kind, children }) => {
  const reducedMotion = useReducedMotion();

  if (kind === 'banner' || reducedMotion) {
    return <KkShellHeader kind={kind}>{children}</KkShellHeader>;
  }

  if (children === undefined || children === null) {
    return null;
  }

  return <FanfareLiftHeader>{children}</FanfareLiftHeader>;
};
