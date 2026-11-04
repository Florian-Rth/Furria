import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, MouseEvent, ReactNode } from 'react';
import { focusRing } from '../internal/focus-ring';
import { inkWash } from '../internal/ink-wash';
import { raisedSurfaceScheme } from '../internal/raised-surface';
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

const barPaint =
  (placement: KkPourQuickPlacement) =>
  (theme: Theme): CSSObject =>
    placement === 'foot'
      ? {
          gap: 0.5,
          p: 0.5,
          borderRadius: `${kkTokens.radius.base}px`,
          ...applyScheme(theme, raisedSurfaceScheme, {
            light: { boxShadow: kkTokens.shadow.floating },
            dark: { boxShadow: kkTokens.chrome.dark.lift },
          }),
        }
      : { gap: 1 };

const itemPaint =
  (placement: KkPourQuickPlacement, lead: boolean) =>
  (theme: Theme): CSSObject => ({
    flex: placement === 'foot' ? 1 : '0 0 auto',
    flexDirection: placement === 'foot' ? 'column' : 'row',
    gap: placement === 'foot' ? 0.25 : 0.75,
    minHeight: placement === 'foot' ? '3.25rem' : '2.5rem',
    px: placement === 'foot' ? 0.5 : 1.75,
    borderRadius: `${kkTokens.radius.base}px`,
    borderWidth: placement === 'foot' ? 0 : kkTokens.line.hair,
    borderStyle: 'solid',
    borderColor: 'divider',
    color: 'text.primary',
    ...focusRing(theme),
    ...(lead
      ? {
          backgroundColor: (theme.vars ?? theme).palette.primary.main,
          borderColor: (theme.vars ?? theme).palette.primary.main,
          color: (theme.vars ?? theme).palette.primary.contrastText,
        }
      : {
          '@media (hover: hover)': { '&:hover': { backgroundColor: inkWash(theme, '6%') } },
        }),
  });

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
  const textVariant = placement === 'foot' ? 'caption' : 'body2';
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
          variant={textVariant}
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
