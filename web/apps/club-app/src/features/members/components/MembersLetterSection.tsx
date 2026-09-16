import { KkLetterDivider, kkMotion } from '@furria/ui';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { toLetterAnchorId } from '../members-labels';
import type { MemberSummary } from '../schemas';
import { MemberRow } from './MemberRow';

const SECTION_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
};

interface MembersLetterSectionProps {
  letter: string;
  members: readonly MemberSummary[];
}

export const MembersLetterSection: FC<MembersLetterSectionProps> = ({ letter, members }) => {
  const anchorId = toLetterAnchorId(letter);
  const rows = members.map((member) => <MemberRow key={member.personId} member={member} />);

  return (
    <motion.div layout="position" transition={kkMotion.layoutGlide} style={SECTION_STYLE}>
      <KkLetterDivider letter={letter} id={anchorId} ground="page" />
      {rows}
    </motion.div>
  );
};
