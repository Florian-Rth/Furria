import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { parsePositiveId } from '@/lib/positive-id';
import { useActCPage } from '../hooks/use-act-c-page';
import { ActCStateBody } from './ActCStateBody';

interface ActCPageProps {
  actId: string;
}

export const ActCPage: FC<ActCPageProps> = ({ actId }) => {
  const page = useActCPage(parsePositiveId(actId));

  return (
    <KkScreen kind="detail" title={page.title} origin={page.origin}>
      <ActCStateBody state={page.state} />
    </KkScreen>
  );
};
