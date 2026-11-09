import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import { useBoardTermRows } from '../hooks/use-board-term-rows';
import { MEMBER_SECTION_TITLES } from '../members-labels';
import type { MemberBoardTerm } from '../schemas';
import { MemberBoardTermRow } from './MemberBoardTermRow';

interface MemberBoardPanelProps {
  terms: readonly MemberBoardTerm[];
}

export const MemberBoardPanel: FC<MemberBoardPanelProps> = ({ terms }) => {
  const rows = useBoardTermRows(terms);

  if (rows.length === 0) {
    return null;
  }

  const items = rows.map((row) => <MemberBoardTermRow key={row.key} row={row} />);

  return (
    <KkPanelSection title={MEMBER_SECTION_TITLES.board}>
      <KkPanel>{items}</KkPanel>
    </KkPanelSection>
  );
};
