import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkEyebrow } from '../../../KkEyebrow';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import type { KkScreenOrigin } from '../../screen-declaration';
import { KkShellBarMark } from '../layout/KkShellBarMark';
import { useKkShell } from '../logic/shell-context';
import { KkShellBarTitle } from './KkShellBarTitle';

const CLOSE_LABEL = 'Schließen';

interface KkShellBarCloseProps {
  origin: KkScreenOrigin;
  title: string;
}

export const KkShellBarClose: FC<KkShellBarCloseProps> = ({ origin, title }) => {
  const { link } = useKkShell();
  const routeProps = { to: origin.to, params: origin.params };

  return (
    <Stack
      component={link}
      {...routeProps}
      aria-label={CLOSE_LABEL}
      direction="row"
      data-kk-shell-bar-close
      sx={(theme) => ({
        alignItems: 'center',
        gap: 0.25,
        minWidth: 0,
        minHeight: kkTokens.tapTarget,
        pr: 1,
        color: 'text.primary',
        textDecoration: 'none',
        cursor: 'pointer',
        ...focusRing(theme),
      })}
    >
      <KkShellBarMark>
        <KkIcon name="close" size="medium" />
      </KkShellBarMark>
      <Stack sx={{ minWidth: 0, gap: 0 }}>
        <KkEyebrow tone="muted" sx={{ lineHeight: 1 }}>
          {origin.label}
        </KkEyebrow>
        <KkShellBarTitle>{title}</KkShellBarTitle>
      </Stack>
    </Stack>
  );
};
