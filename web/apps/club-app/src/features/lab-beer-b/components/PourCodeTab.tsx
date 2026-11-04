import { KkButton } from '@furria/ui/KkButton';
import { KkQrCode } from '@furria/ui/KkQrCode';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { CODE_ACTION, CODE_LEAD, PRINT_LABEL } from '../pour-hub-copy';

const BOOKING_PATH = '/lab-beer-book-b';

const print = (): void => {
  window.print();
};

export const PourCodeTab: FC = () => {
  const value = `${window.location.origin}${BOOKING_PATH}`;

  return (
    <Stack sx={{ gap: 2, alignItems: 'center' }}>
      <KkText variant="body2" tone="secondary">
        {CODE_LEAD}
      </KkText>
      <KkQrCode value={value} label={CODE_ACTION} />
      <KkText variant="caption" tone="secondary">
        {value}
      </KkText>
      <KkButton variant="outlined" onClick={print}>
        {PRINT_LABEL}
      </KkButton>
    </Stack>
  );
};
