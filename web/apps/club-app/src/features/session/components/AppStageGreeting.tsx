import { KkAppShell } from '@furria/ui';
import type { FC } from 'react';
import { useMeQuery } from '../api';
import { buildGreeting, formatStageDate } from '../stage-greeting';

export const AppStageGreeting: FC = () => {
  const me = useMeQuery();
  const greeting = buildGreeting(me.data?.person.firstName ?? '');
  const today = formatStageDate(new Date());

  return <KkAppShell.Greeting greeting={greeting} date={today} />;
};
