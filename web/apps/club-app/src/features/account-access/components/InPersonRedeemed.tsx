import { KkHeading, KkNote, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toRedeemedLine, toRedeemedTitle } from '../account-access-labels';

interface InPersonRedeemedProps {
  firstName: string;
}

export const InPersonRedeemed: FC<InPersonRedeemedProps> = ({ firstName }) => {
  const title = toRedeemedTitle(firstName);
  const line = toRedeemedLine(firstName);

  return (
    <KkPanel variant="block">
      <Stack role="status" sx={{ gap: 1, minWidth: 0 }}>
        <KkHeading level={1} component="p" tone="accent">
          {title}
        </KkHeading>
        <KkNote>{line}</KkNote>
      </Stack>
    </KkPanel>
  );
};
