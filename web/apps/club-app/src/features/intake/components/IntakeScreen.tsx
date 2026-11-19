import type { FC } from 'react';
import { LinkPageFrame } from '@/features/link-page/components/LinkPageFrame';
import { useIntakePage } from '../hooks/use-intake-page';
import { IntakeBody } from './IntakeBody';

export const IntakeScreen: FC = () => {
  const page = useIntakePage();

  return (
    <LinkPageFrame>
      <IntakeBody page={page} />
    </LinkPageFrame>
  );
};
