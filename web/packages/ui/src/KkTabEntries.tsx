import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, MouseEvent } from 'react';
import { focusRing } from './internal/focus-ring';
import { goldInkOf } from './internal/gold-ink';
import { inkWashSurface } from './internal/ink-wash';
import { redInk } from './internal/red-ink';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import { stepFigures } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export interface KkTabEntry {
  id: string;
  icon: KkIconName;
  label: string;
  flag?: string | null;
  attention?: boolean;
}

const TILE = '2.5rem';

const entryPaint = (theme: Theme): CSSObject => ({
  flex: '1 1 0',
  minWidth: 0,
  flexDirection: 'column',
  gap: 0.5,
  py: 0.75,
  px: 0.25,
  borderRadius: `${kkTokens.radius.base}px`,
  color: 'text.primary',
  ...focusRing(theme),
  '& [data-tab-entry-tile]': {
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    width: TILE,
    height: TILE,
    borderRadius: `${kkTokens.radius.base - 2}px`,
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    borderColor: 'divider',
    backgroundColor: (theme.vars ?? theme).palette.background.paper,
    transition: 'border-color 160ms ease-out',
  },
  '&[aria-current="true"] [data-tab-entry-tile]': {
    ...inkWashSurface(theme, '7%', '12%'),
    borderColor: 'text.primary',
  },
  '&[aria-current="true"] [data-tab-entry-label]': redInk(theme),
  '@media (hover: hover)': {
    '&:hover [data-tab-entry-tile]': { borderColor: 'text.primary' },
  },
});

const flagPaint =
  (attention: boolean) =>
  (theme: Theme): CSSObject => ({
    ...stepFigures,
    position: 'absolute',
    top: '-0.4rem',
    right: '-0.55rem',
    minWidth: '1.15rem',
    height: '1.15rem',
    px: 0.375,
    display: 'grid',
    placeItems: 'center',
    borderRadius: `${kkTokens.radius.pill}px`,
    typography: 'caption',
    fontWeight: 800,
    lineHeight: 1,
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    borderColor: 'divider',
    backgroundColor: (theme.vars ?? theme).palette.background.paper,
    ...(attention
      ? { ...goldInkOf(theme), borderColor: 'currentColor' }
      : { color: 'text.primary' }),
  });

interface KkTabEntriesProps {
  label: string;
  items: readonly KkTabEntry[];
  selected: string | null;
  onSelect: (id: string) => void;
  sx?: KkSx;
}

export const KkTabEntries: FC<KkTabEntriesProps> = ({ label, items, selected, onSelect, sx }) => {
  const choose = (event: MouseEvent<HTMLButtonElement>): void => {
    const id = event.currentTarget.dataset.kkTabEntry;

    if (id !== undefined) {
      onSelect(id);
    }
  };
  const entries = items.map((item) => {
    const flag =
      item.flag === undefined || item.flag === null ? null : (
        <Box component="span" sx={flagPaint(item.attention === true)}>
          {item.flag}
        </Box>
      );

    return (
      <ButtonBase
        key={item.id}
        data-kk-tab-entry={item.id}
        aria-current={item.id === selected ? 'true' : undefined}
        onClick={choose}
        sx={entryPaint}
      >
        <Box component="span" data-tab-entry-tile>
          <KkIcon name={item.icon} size="small" />
          {flag}
        </Box>
        <Box
          component="span"
          data-tab-entry-label
          lang="de"
          sx={{
            hyphens: 'auto',
            typography: 'caption',
            fontWeight: 800,
            lineHeight: 1.15,
            textAlign: 'center',
            overflowWrap: 'normal',
          }}
        >
          {item.label}
        </Box>
      </ButtonBase>
    );
  });

  return (
    <Stack
      direction="row"
      component="nav"
      aria-label={label}
      data-kk-tab-entries
      sx={[
        { gap: 0.25, minWidth: 0, alignItems: 'flex-start' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {entries}
    </Stack>
  );
};
