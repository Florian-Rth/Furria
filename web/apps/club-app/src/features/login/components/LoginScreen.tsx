import {
  KkAlert,
  KkBrandStage,
  KkEyebrow,
  KkHeading,
  KkNote,
  KkSplitLayout,
  useIsMobile,
} from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { SESSION_EXPIRED_MESSAGE } from '../login-messages';
import { buildLoginStageMeta } from '../stage-meta';
import { LoginForm } from './LoginForm';
import { LoginPendingEntries } from './LoginPendingEntries';
import { LoginTestCredentials } from './LoginTestCredentials';

const HEADING_LEVEL = { mobile: 4, desktop: 3 } as const;

interface LoginScreenProps {
  expired: boolean;
}

export const LoginScreen: FC<LoginScreenProps> = ({ expired }) => {
  const isMobile = useIsMobile();
  const stageMeta = buildLoginStageMeta(new Date());
  const headingLevel = isMobile ? HEADING_LEVEL.mobile : HEADING_LEVEL.desktop;
  const expiredNotice = expired ? (
    <KkAlert severity="warning">{SESSION_EXPIRED_MESSAGE}</KkAlert>
  ) : null;

  return (
    <KkSplitLayout>
      <KkSplitLayout.Stage>
        <KkBrandStage>
          <KkBrandStage.Meta>
            <KkEyebrow tone="muted">{stageMeta.place}</KkEyebrow>
            <Stack sx={{ alignItems: 'flex-end', gap: 0.5 }}>
              <KkEyebrow tone="muted">{stageMeta.number}</KkEyebrow>
              <KkEyebrow tone="muted">{stageMeta.session}</KkEyebrow>
            </Stack>
          </KkBrandStage.Meta>
        </KkBrandStage>
      </KkSplitLayout.Stage>
      <KkSplitLayout.Pane>
        <Stack sx={{ gap: 1 }}>
          <KkHeading level={headingLevel} component="h1">
            ANMELDEN
          </KkHeading>
          <KkNote>Der Mitgliederbereich des Furrscher Carnevals Club.</KkNote>
        </Stack>
        {expiredNotice}
        <LoginForm />
        <LoginPendingEntries />
        <LoginTestCredentials />
      </KkSplitLayout.Pane>
    </KkSplitLayout>
  );
};
