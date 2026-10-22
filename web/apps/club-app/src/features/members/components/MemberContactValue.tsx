import { KkMeta } from '@furria/ui/KkMeta';
import type { FC } from 'react';

const EMPTY_VALUE = 'nicht hinterlegt';

interface MemberContactValueProps {
  value: string | null;
}

export const MemberContactValue: FC<MemberContactValueProps> = ({ value }) => {
  if (value === null) {
    return (
      <KkMeta component="span" italic>
        {EMPTY_VALUE}
      </KkMeta>
    );
  }

  return value;
};
