import { KkTitleHeader } from '@furria/ui';
import type { FC, ReactNode } from 'react';
import { START_TITLE, usePermissions } from '@/features/session';
import { START_MANAGING_LEAD } from '../start-messages';
import { MemberHead } from './MemberHead';
import { StartHeaderRow } from './StartHeaderRow';

interface StartHeaderProps {
  strip: ReactNode;
  onCountPress: () => void;
}

export const StartHeader: FC<StartHeaderProps> = ({ strip, onCountPress }) => {
  const { isManagingLogin } = usePermissions();
  const lead = isManagingLogin ? (
    <KkTitleHeader title={START_TITLE} lead={START_MANAGING_LEAD} />
  ) : (
    <MemberHead onPress={onCountPress} />
  );

  return <StartHeaderRow lead={lead} strip={strip} />;
};
