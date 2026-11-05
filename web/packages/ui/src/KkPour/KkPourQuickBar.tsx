import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, MouseEvent, ReactNode } from 'react';
import { focusRing } from '../internal/focus-ring';
import { inkWash } from '../internal/ink-wash';
import { raisedSurfaceScheme } from '../internal/raised-surface';
import type { KkScheme } from '../internal/scheme-paint';
import { applyScheme } from '../internal/scheme-paint';
import type { KkIconName } from '../KkIcon';
import { KkIcon } from '../KkIcon';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import { KkPourCrate } from './KkPourCrate';

export type KkPourQuickPlacement = 'foot' | 'top';

export interface KkPourQuickItem {
  id: string;
  label: string;
  icon: KkIconName | 'crate';
  lead?: boolean;
}

const ICON = '1.25rem';

const FLOATING: KkScheme = {
  light: { boxShadow: kkTokens.shadow.floating },
  dark: { boxShadow: kkTokens.chrome.dark.lift },
};

const NO_SCHEME: KkScheme = { light: {}, dark: {} };

const barPaint = (placement: KkPourQuickPlacement): CSSObject =>
  placement === 'foot' ? { gap: 1, alignItems: 'stretch' } : { gap: 1, alignItems: 'center' };

const leadPaint = (theme: Theme): CSSObject => {
  const { primary } = (theme.vars ?? theme).palette;

  return {
    backgroundColor: primary.main,
    borderColor: primary.main,
    color: primary.contrastText,
    '@media (hover: hover)': { '&:hover': { backgroundColor: primary.dark } },
  };
};

const followPaint = (theme: Theme): CSSObject => {
  const wash = inkWash(theme, '6%');

  return {
    borderColor: 'divider',
    color: 'text.primary',
    '@media (hover: hover)': {
      '&:hover': { backgroundImage: `linear-gradient(${wash}, ${wash})` },
    },
  };
};

const itemPaint =
  (placement: KkPourQuickPlacement, lead: boolean) =>
  (theme: Theme): CSSObject => {
    const floats = placement === 'foot';
    const fill = lead ? NO_SCHEME : raisedSurfaceScheme;

    return {
      flex: floats && lead ? '1 1 auto' : '0 0 auto',
      gap: 0.75,
      minHeight: floats ? '3rem' : '2.5rem',
      px: floats ? 1.5 : 1.75,
      borderRadius: `${kkTokens.radius.pill}px`,
      borderWidth: kkTokens.line.hair,
      borderStyle: 'solid',
      ...focusRing(theme),
      ...applyScheme(theme, fill, floats ? FLOATING : NO_SCHEME),
      ...(lead ? leadPaint(theme) : followPaint(theme)),
    };
  };

const markOf = (icon: KkPourQuickItem['icon']): ReactNode =>
  icon === 'crate' ? (
    <KkPourCrate filled size="glyph" tone="ink" sx={{ width: ICON, color: 'inherit' }} />
  ) : (
    <KkIcon name={icon} sx={{ width: ICON, height: ICON }} />
  );

interface KkPourQuickBarProps {
  label: string;
  items: readonly KkPourQuickItem[];
  placement: KkPourQuickPlacement;
  onSelect: (id: string) => void;
  sx?: KkSx;
}

export const KkPourQuickBar: FC<KkPourQuickBarProps> = ({
  label,
  items,
  placement,
  onSelect,
  sx,
}) => {
  const choose = (event: MouseEvent<HTMLButtonElement>): void => {
    onSelect(event.currentTarget.dataset.id ?? '');
  };
  const buttons = items.map((item) => {
    const mark = markOf(item.icon);
    const paint = itemPaint(placement, item.lead === true);

    return (
      <ButtonBase
        key={item.id}
        data-id={item.id}
        data-kk-pour-quick={item.id}
        onClick={choose}
        sx={paint}
      >
        {mark}
        <Typography
          variant="body2"
          component="span"
          noWrap
          sx={{ fontWeight: 800, color: 'inherit', lineHeight: 1.2 }}
        >
          {item.label}
        </Typography>
      </ButtonBase>
    );
  });

  return (
    <Stack
      direction="row"
      role="toolbar"
      aria-label={label}
      data-kk-pour-quick-bar={placement}
      sx={[barPaint(placement), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {buttons}
    </Stack>
  );
};
