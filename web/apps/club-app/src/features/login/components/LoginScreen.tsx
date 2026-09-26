import { KkAlert, KkBrandStage, KkEyebrow, KkHeading, KkNote, KkSplitLayout } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SessionFarewell } from '@/lib/api/session/session-store';
import { ACCOUNT_DELETED_MESSAGE, SESSION_EXPIRED_MESSAGE } from '../login-messages';
import { buildLoginStageMeta } from '../stage-meta';
import { LoginForm } from './LoginForm';
import { LoginHelpNote } from './LoginHelpNote';
import { LoginTestCredentials } from './LoginTestCredentials';
import { LoginWaysOn } from './LoginWaysOn';

const INTRO = 'Der Mitgliederbereich des FCC.';

interface LoginScreenProps {
  expired: boolean;
  farewell: SessionFarewell | null;
}

export const LoginScreen: FC<LoginScreenProps> = ({ expired, farewell }) => {
  const stageMeta = buildLoginStageMeta(new Date());
  const expiredNotice = expired ? (
    <KkAlert severity="warning">{SESSION_EXPIRED_MESSAGE}</KkAlert>
  ) : null;
  const farewellNotice =
    farewell === 'account-deleted' ? (
      <KkAlert severity="info">{ACCOUNT_DELETED_MESSAGE}</KkAlert>
    ) : null;

  return (
    <KkSplitLayout>
      <KkSplitLayout.Stage>
        <KkBrandStage variant="band">
          <KkBrandStage.Meta>
            <KkEyebrow tone="muted">{stageMeta.place}</KkEyebrow>
            <KkEyebrow tone="muted">{stageMeta.session}</KkEyebrow>
          </KkBrandStage.Meta>
        </KkBrandStage>
      </KkSplitLayout.Stage>
      <KkSplitLayout.Pane>
        <Stack sx={{ gap: 1 }}>
          <KkHeading level={1} component="h1">
            ANMELDEN
          </KkHeading>
          <KkNote>{INTRO}</KkNote>
        </Stack>
        {expiredNotice}
        {farewellNotice}
        <LoginForm />
        <LoginWaysOn />
        <LoginHelpNote />
        <LoginTestCredentials />
      </KkSplitLayout.Pane>
    </KkSplitLayout>
  );
};
