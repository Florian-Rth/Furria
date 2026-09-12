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
import { LoginHelpNote } from './LoginHelpNote';

const HEADING_LEVEL = { mobile: 4, desktop: 3 } as const;
const INTRO = 'Der Mitgliederbereich des FCC.';

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
        <KkBrandStage variant="band">
          <KkBrandStage.Meta>
            <KkEyebrow tone="muted">{stageMeta.place}</KkEyebrow>
            <KkEyebrow tone="muted">{stageMeta.session}</KkEyebrow>
          </KkBrandStage.Meta>
        </KkBrandStage>
      </KkSplitLayout.Stage>
      <KkSplitLayout.Pane>
        <Stack sx={{ gap: 1 }}>
          <KkHeading level={headingLevel} component="h1">
            ANMELDEN
          </KkHeading>
          <KkNote>{INTRO}</KkNote>
        </Stack>
        {expiredNotice}
        <LoginForm />
        <LoginHelpNote />
      </KkSplitLayout.Pane>
    </KkSplitLayout>
  );
};
