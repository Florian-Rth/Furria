import { KkEyebrow, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const TEST_EMAIL = 'admin@furria.local';
const TEST_PASSWORD = 'Furria-Dev-Admin-1!';

export const LoginTestCredentials: FC = () => (
  <Stack sx={{ gap: 0.5 }}>
    <KkEyebrow>Testzugang</KkEyebrow>
    <KkText variant="body2">{TEST_EMAIL}</KkText>
    <KkText variant="body2">{TEST_PASSWORD}</KkText>
  </Stack>
);
