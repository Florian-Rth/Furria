import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { blueInkOf } from '../../../internal/blue-ink';
import { focusRing } from '../../../internal/focus-ring';
import { tapArea } from '../../../internal/tap-area';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { KkStateGlyph } from '../../../KkStatePill/KkStateGlyph';
import type { KkStepState } from '../../../KkStatePill/step-state';
import type { KkSx } from '../../../kk-sx';

const GLYPH_EXTENT = '0.875rem';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const linePaint =
  (interactive: boolean) =>
  (theme: Theme): CSSObject => ({
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: 0.75,
    py: 0.625,
    px: 0,
    m: 0,
    border: 0,
    background: 'none',
    textAlign: 'left',
    color: palette(theme).text.primary,
    appearance: 'none',
    ...(interactive
      ? {
          ...tapArea(),
          cursor: 'pointer',
          ...focusRing(theme),
          '@media (hover: hover)': {
            '&:hover .kk-bulletin-line-name': { textDecoration: 'underline' },
          },
        }
      : {}),
  });

const kindInk =
  (state: KkStepState) =>
  (theme: Theme): CSSObject =>
    state === 'current' ? blueInkOf(theme) : { color: palette(theme).text.secondary };

interface KkBulletinLineProps {
  icon: KkIconName;
  state: KkStepState;
  name: string;
  fact: string | null;
  onSelect?: () => void;
  sx?: KkSx;
}

export const KkBulletinLine: FC<KkBulletinLineProps> = ({
  icon,
  state,
  name,
  fact,
  onSelect,
  sx,
}) => {
  const interactive = onSelect !== undefined;
  const component = interactive ? 'button' : 'div';
  const nativeProps = interactive ? { type: 'button' as const } : {};
  const glyph =
    state === 'open' ? null : (
      <KkStateGlyph
        state={state}
        sx={{ width: GLYPH_EXTENT, height: GLYPH_EXTENT, flexShrink: 0 }}
      />
    );
  const factLine =
    fact === null ? null : (
      <Typography
        component="span"
        variant="caption"
        noWrap
        sx={[{ fontWeight: 700, flexShrink: 0, color: 'text.secondary' }, kindInk(state)]}
      >
        {fact}
      </Typography>
    );

  return (
    <Stack component="li" sx={[{ minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Stack
        direction="row"
        component={component}
        {...nativeProps}
        onClick={onSelect}
        data-kk-bulletin-line={state}
        sx={linePaint(interactive)}
      >
        <KkIcon name={icon} size="small" sx={[{ flexShrink: 0 }, kindInk(state)]} />
        <Typography
          component="span"
          variant="body2"
          noWrap
          className="kk-bulletin-line-name"
          sx={{ fontWeight: 700, minWidth: 0, flex: 1 }}
        >
          {name}
        </Typography>
        {glyph}
        {factLine}
      </Stack>
    </Stack>
  );
};
