import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import { useLanding } from '@/features/write';
import type { ClubRecord } from '../schemas';
import { ClubAccessPanel } from './ClubAccessPanel';
import { ClubContactPanel } from './ClubContactPanel';
import { ClubIdentityPanel } from './ClubIdentityPanel';

interface ClubRecordViewProps {
  record: ClubRecord;
}

export const ClubRecordView: FC<ClubRecordViewProps> = ({ record }) => {
  const { highlightedKey } = useLanding();

  return (
    <KkPanelStack>
      <ClubIdentityPanel record={record} highlightedKey={highlightedKey} />
      <ClubContactPanel record={record} highlightedKey={highlightedKey} />
      <ClubAccessPanel record={record} highlightedKey={highlightedKey} />
    </KkPanelStack>
  );
};
