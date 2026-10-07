import { KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { START_TITLE, usePermissions } from '@/features/session';
import { START_MANAGING_LEAD } from '../start-messages';
import { StartGreeting } from './StartGreeting';

export const StartHeader: FC = () => {
  const { isManagingLogin } = usePermissions();

  if (isManagingLogin) {
    return <KkTitleHeader title={START_TITLE} lead={START_MANAGING_LEAD} />;
  }

  return <StartGreeting />;
};
