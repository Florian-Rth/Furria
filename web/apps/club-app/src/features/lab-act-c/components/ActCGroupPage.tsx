import { KkScreen } from '@furria/ui/KkScreen';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { parsePositiveId } from '@/lib/positive-id';
import { LAB_ORIGIN_LABEL } from '../act-c-copy';
import { useActCGroup } from '../hooks/use-act-c-group';
import { LAB_PATH } from '../lab-act-c-paths';
import { ActCGroupStateBody } from './ActCGroupStateBody';

const LAB_ORIGIN: KkScreenOrigin = { label: LAB_ORIGIN_LABEL, to: LAB_PATH };

interface ActCGroupPageProps {
  groupId: string;
}

export const ActCGroupPage: FC<ActCGroupPageProps> = ({ groupId }) => {
  const group = useActCGroup(parsePositiveId(groupId));

  return (
    <KkScreen kind="detail" title={group.title} origin={LAB_ORIGIN}>
      <ActCGroupStateBody state={group.state} />
    </KkScreen>
  );
};
