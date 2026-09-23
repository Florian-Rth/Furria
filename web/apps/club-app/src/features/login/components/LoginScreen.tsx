import { KkAlert, KkBrandStage, KkEyebrow, KkHeading, KkNote, KkSplitLayout } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { SESSION_EXPIRED_MESSAGE } from '../login-messages';
import { buildLoginStageMeta } from '../stage-meta';
import { LoginForm } from './LoginForm';
import { LoginHelpNote } from './LoginHelpNote';
import { LoginTestCredentials } from './LoginTestCredentials';

const INTRO = 'Der Mitgliederbereich des FCC.';

interface LoginScreenProps {
  expired: boolean;
}

export const LoginScreen: FC<LoginScreenProps> = ({ expired }) => {
  const stageMeta = buildLoginStageMeta(new Date());
  const expiredNotice = expired ? (
    <KkAlert severity="warning">{SESSION_EXPIRED_MESSAGE}</KkAlert>
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
        <LoginForm />
        <LoginHelpNote />
        <LoginTestCredentials />
      </KkSplitLayout.Pane>
    </KkSplitLayout>
  );
};
