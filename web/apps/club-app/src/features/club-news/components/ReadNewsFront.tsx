import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { ReadNewsFront as Front } from '../read-news';
import { ReadNewsLead } from './ReadNewsLead';
import { ReadNewsSession } from './ReadNewsSession';

interface ReadNewsFrontProps {
  front: Front;
}

export const ReadNewsFront: FC<ReadNewsFrontProps> = ({ front }) => {
  const sessions = front.sessions.map((session) => (
    <ReadNewsSession key={session.key} session={session} />
  ));

  return (
    <Stack sx={{ rowGap: 3, minWidth: 0 }}>
      <ReadNewsLead post={front.lead} />
      {sessions}
    </Stack>
  );
};
