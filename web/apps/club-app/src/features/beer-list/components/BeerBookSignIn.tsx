import { KkTabStage } from '@furria/ui/KkTabStage';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { LoginForm } from '@/features/login/components/LoginForm';
import { PasskeySignIn } from '@/features/login/components/PasskeySignIn';
import { SIGN_IN_TEXT, SIGN_IN_TITLE } from '../beer-book-copy';
import { BEER_LIST_TITLE } from '../beer-list-copy';
import { BeerBookHead } from './BeerBookHead';

export const BeerBookSignIn: FC = () => (
  <>
    <KkTabStage.Top>
      <BeerBookHead caption={BEER_LIST_TITLE} title={SIGN_IN_TITLE} />
    </KkTabStage.Top>
    <KkTabStage.Middle>
      <Stack sx={{ alignSelf: 'stretch', gap: 2.5, minWidth: 0 }}>
        <KkText variant="body2" tone="secondary">
          {SIGN_IN_TEXT}
        </KkText>
        <LoginForm />
        <PasskeySignIn />
      </Stack>
    </KkTabStage.Middle>
  </>
);
