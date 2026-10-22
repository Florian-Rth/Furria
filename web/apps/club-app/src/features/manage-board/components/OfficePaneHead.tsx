import { KkOfficeHead } from '@furria/ui/KkOfficeHead';
import { KkOfficeMark } from '@furria/ui/KkOfficeMark';
import type { FC, ReactNode } from 'react';
import { toOfficeMarkState } from '../board-hub';
import type { BoardOffice } from '../schemas';
import { OfficeHeadFacts } from './OfficeHeadFacts';

interface OfficePaneHeadProps {
  office: BoardOffice;
  isVacant: boolean;
  actions?: ReactNode;
}

export const OfficePaneHead: FC<OfficePaneHeadProps> = ({ office, isVacant, actions }) => {
  const mark = (
    <KkOfficeMark icon={office.icon} state={toOfficeMarkState(office, isVacant)} size="large" />
  );
  const facts = <OfficeHeadFacts office={office} isVacant={isVacant} />;

  return <KkOfficeHead mark={mark} title={office.name} facts={facts} actions={actions} />;
};
