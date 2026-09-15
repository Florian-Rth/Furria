import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkChrome } from '../../../internal/KkChrome';
import { kkTokens } from '../../../tokens';
import { KkShellFoot } from '../layout/KkShellFoot';
import { useKkShell } from '../logic/shell-context';
import { KkShellNavItem } from './KkShellNavItem';

const { navHeight } = kkTokens.shell;
const NAV_LABEL = 'Bereiche';
const NAV_DENSITY = 1;
const NAV_PADDING_X = 0.5;

interface KkShellNavProps {
  section: string;
}

export const KkShellNav: FC<KkShellNavProps> = ({ section }) => {
  const { destinations, keyboardOpen } = useKkShell();

  if (keyboardOpen) {
    return null;
  }

  const items = destinations.map((destination) => (
    <KkShellNavItem
      key={destination.id}
      destination={destination}
      active={destination.id === section}
    />
  ));

  return (
    <KkShellFoot>
      <KkChrome density={NAV_DENSITY} sx={{ height: `${navHeight}px`, px: NAV_PADDING_X }}>
        <Stack
          component="nav"
          aria-label={NAV_LABEL}
          direction="row"
          sx={{ flex: 1, alignItems: 'stretch', minWidth: 0 }}
        >
          {items}
        </Stack>
      </KkChrome>
    </KkShellFoot>
  );
};
