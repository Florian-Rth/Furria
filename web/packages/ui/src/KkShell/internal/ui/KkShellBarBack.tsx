import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import type { KkScreenOrigin } from '../../screen-declaration';
import { KkShellBarMark } from '../layout/KkShellBarMark';
import { useKkShell } from '../logic/shell-context';

const BACK_PREFIX = 'Zurück zu ';

interface KkShellBarBackProps extends PropsWithChildren {
  origin: KkScreenOrigin;
}

export const KkShellBarBack: FC<KkShellBarBackProps> = ({ origin, children }) => {
  const { link } = useKkShell();
  const routeProps = { to: origin.to, params: origin.params };

  return (
    <Stack
      component={link}
      {...routeProps}
      aria-label={`${BACK_PREFIX}${origin.label}`}
      direction="row"
      data-kk-shell-bar-back
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
        <KkIcon name="back" size="medium" />
      </KkShellBarMark>
      {children}
    </Stack>
  );
};
