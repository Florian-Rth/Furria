import { KkOfficeMark, KkScreenHeader } from '@furria/ui';
import type { FC } from 'react';
import { isOfficeVacant, toOfficeMarkState } from '../board-hub';
import type { BoardOffice } from '../schemas';
import { OfficeHeadFacts } from './OfficeHeadFacts';

interface BoardOfficeHeaderProps {
  office: BoardOffice;
  today: string;
}

export const BoardOfficeHeader: FC<BoardOfficeHeaderProps> = ({ office, today }) => {
  const isVacant = isOfficeVacant(office, today);

  return (
    <KkScreenHeader>
      <KkScreenHeader.Visual>
        <KkOfficeMark icon={office.icon} state={toOfficeMarkState(office, isVacant)} size="large" />
      </KkScreenHeader.Visual>
      <KkScreenHeader.Text>
        <KkScreenHeader.Title transform="none">{office.name}</KkScreenHeader.Title>
        <OfficeHeadFacts office={office} isVacant={isVacant} />
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};
