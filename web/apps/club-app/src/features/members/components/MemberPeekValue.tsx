import { KkMeta } from '@furria/ui';
import type { FC } from 'react';
import { MEMBER_PEEK_EMPTY_VALUE } from '../members-labels';

interface MemberPeekValueProps {
  line: string | null;
}

export const MemberPeekValue: FC<MemberPeekValueProps> = ({ line }) => {
  if (line === null) {
    return (
      <KkMeta component="span" italic>
        {MEMBER_PEEK_EMPTY_VALUE}
      </KkMeta>
    );
  }

  return line;
};
